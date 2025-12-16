import csv
import os
import json
import requests
from dotenv import load_dotenv

# Carrega variáveis do .env
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# --- CONFIGURAÇÃO ---
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERRO: Credenciais do Supabase não encontradas no .env")
    exit(1)

# Headers para a API REST do Supabase
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal" # Não retorna os dados inseridos para economizar banda
}

def limpar_valor(valor):
    """Trata valores vazios"""
    if not valor or valor.strip() == "":
        return None
    return valor.strip()

def realizar_etl(caminho_csv, tabela_destino):
    print(f"Iniciando ETL (Modo Light) do arquivo: {caminho_csv}")
    
    endpoint = f"{SUPABASE_URL}/rest/v1/{tabela_destino}"
    
    try:
        registros_para_inserir = []
        
        with open(caminho_csv, mode='r', encoding='utf-8-sig', newline='') as f:
            # Detecta o delimitador automaticamente (vírgula ou ponto e vírgula)
            sample = f.read(1024)
            f.seek(0)
            sniffer = csv.Sniffer()
            try:
                dialect = sniffer.sniff(sample)
            except:
                # Fallback para vírgula se falhar
                dialect = 'excel' 
                
            reader = csv.DictReader(f, dialect=dialect)
            
            # Normalizar nomes das colunas (remove espaços extras)
            reader.fieldnames = [name.strip() for name in reader.fieldnames]
            
            print(f"Colunas detectadas: {reader.fieldnames}")

            for row in reader:
                # Mapeamento manual baseado no seu CSV
                registro = {
                    "matvin": limpar_valor(row.get('MATVIN')),
                    "servidor": limpar_valor(row.get('SERVIDOR')), # Sem espaço no final
                    "cargo_funcao": limpar_valor(row.get('CARGO/FUNÇÃO')),
                    "atividade": limpar_valor(row.get('ATIVIDADE')),
                    "vacancia": limpar_valor(row.get('VACANCIA')),
                    "status": limpar_valor(row.get('STATUS')),
                    "ultima_lotacao": limpar_valor(row.get('ÚLTIMA LOTAÇÃO?')),
                    "dre": limpar_valor(row.get('DRE')),
                    "secretaria_pertencente": limpar_valor(row.get('SECRETARIA PERTENCENTE')),
                    "municipio": limpar_valor(row.get('MUNICIPIO')),
                    "atendido_candidato": limpar_valor(row.get('ATENDIDO/CANDIDATO')),
                    "candidato_convocado": limpar_valor(row.get('CANDIDATO CONVOCADO HABILITADO NA ENTREVISTA')),
                    "observacao": limpar_valor(row.get('OBSERVAÇÃO'))
                }
                registros_para_inserir.append(registro)

        # Carga em lotes
        if registros_para_inserir:
            print(f"Total de registros lidos: {len(registros_para_inserir)}")
            
            tamanho_lote = 100
            total_inseridos = 0
            
            for i in range(0, len(registros_para_inserir), tamanho_lote):
                lote = registros_para_inserir[i:i + tamanho_lote]
                
                response = requests.post(endpoint, headers=headers, json=lote)
                
                if response.status_code in [200, 201, 204]:
                    total_inseridos += len(lote)
                    print(f"Lote {i//tamanho_lote + 1}: Inseridos {len(lote)} registros. Total: {total_inseridos}")
                else:
                    print(f"Erro no lote {i//tamanho_lote + 1}: {response.status_code} - {response.text}")
                
            print("ETL concluído!")
        else:
            print("Nenhum registro encontrado.")

    except FileNotFoundError:
        print(f"Erro: Arquivo não encontrado em {caminho_csv}")
    except Exception as e:
        print(f"Erro crítico: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    csv_path = os.path.join(os.path.dirname(__file__), 'Controle.csv')
    # obs: certifique-se que a tabela 'controle_vagas' existe no supabase
    tabela = 'controle_vagas' 
    realizar_etl(csv_path, tabela)
