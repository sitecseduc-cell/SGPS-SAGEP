import pandas as pd
from supabase import create_client, Client
import math

# --- CONFIGURAÇÃO ---
URL = "https://qtabcmusmorupvpkptif.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWJjbXVzbW9ydXB2cGtwdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkwMDIsImV4cCI6MjA4MDg4NTAwMn0.8dh6YD6rirR8mHA7ffdKmYqwzqHCypn2XAWkBQS5vf8" # Cuidado, não exponha isso no GitHub
supabase: Client = create_client(URL, KEY)

# ID do Processo (Crie um manualmente no banco primeiro e cole o ID aqui)
PROCESSO_ID = "COLE_O_UUID_AQUI" 

def limpar_texto(texto):
    if pd.isna(texto) or texto == "":
        return None
    return str(texto).strip().upper()

def migrar_controle_vagas():
    print("Iniciando migração de VAGAS...")
    # Carregando CSV (Ajuste o nome do arquivo se precisar)
    try:
        df = pd.read_csv('CONTROLE NECESSIDADES ANALISTAS POR SUBSTITUIÇÃO - 02-09.xlsx - CONTROLE DE VAGAS.csv')
    except FileNotFoundError:
        print("Erro: Arquivo 'CONTROLE NECESSIDADES ANALISTAS POR SUBSTITUIÇÃO - 02-09.xlsx - CONTROLE DE VAGAS.csv' não encontrado.")
        return

    vagas_para_inserir = []
    
    for index, row in df.iterrows():
        # Mapeando colunas do Excel para o Banco
        vaga = {
            "processo_id": PROCESSO_ID,
            "municipio": limpar_texto(row.get('MUNICIPIO')),
            "dre": limpar_texto(row.get('DRE')),
            "cargo": limpar_texto(row.get('CARGO/FUNÇÃO') or row.get('CARGO')),
            "escola_lotacao": limpar_texto(row.get('LOTAÇÃO') or row.get('ÚLTIMA LOTAÇÃO?')),
            "status": 'OCUPADA' if limpar_texto(row.get('STATUS')) == 'ATIVO' else 'ABERTA',
            "data_vacancia": row.get('VACANCIA') if pd.notna(row.get('VACANCIA')) else None,
            "observacao": limpar_texto(row.get('OBSERVAÇÃO'))
        }
        
        # Filtro básico para não inserir linhas vazias
        if vaga['cargo']:
            vagas_para_inserir.append(vaga)

    # Inserção em lotes (Batch insert) para ser rápido
    if vagas_para_inserir:
        try:
            data, count = supabase.table('vagas').insert(vagas_para_inserir).execute()
            print(f"Sucesso! {len(vagas_para_inserir)} vagas inseridas.")
        except Exception as e:
            print(f"Erro ao inserir vagas: {e}")

def migrar_contratos_assinados():
    print("Iniciando migração de CANDIDATOS CONTRATADOS...")
    try:
        df = pd.read_csv('CONTROLE NECESSIDADES ANALISTAS POR SUBSTITUIÇÃO - 02-09.xlsx - CONTRATOS ASSINADOS ATÉ 14-10-2.csv')
    except FileNotFoundError:
        print("Erro: Arquivo 'CONTROLE NECESSIDADES ANALISTAS POR SUBSTITUIÇÃO - 02-09.xlsx - CONTRATOS ASSINADOS ATÉ 14-10-2.csv' não encontrado.")
        return

    candidatos_para_inserir = []

    for index, row in df.iterrows():
        candidato = {
            "processo_id": PROCESSO_ID,
            "nome_completo": limpar_texto(row.get('CANDIDATO')),
            "cpf": limpar_texto(row.get('CPF')), # Vai vir com asteriscos, paciência por enquanto
            "municipio_inscricao": limpar_texto(row.get('MUNICIPIO')),
            "cargo_inscricao": limpar_texto(row.get('CARGO')),
            "status_geral": 'CONTRATADO'
        }

        if candidato['nome_completo']:
             candidatos_para_inserir.append(candidato)
    
    if candidatos_para_inserir:
        try:
            data, count = supabase.table('candidatos').insert(candidatos_para_inserir).execute()
            print(f"Sucesso! {len(candidatos_para_inserir)} candidatos inseridos.")
        except Exception as e:
            print(f"Erro ao inserir candidatos: {e}")

# --- EXECUÇÃO ---
# migrar_controle_vagas()
# migrar_contratos_assinados()