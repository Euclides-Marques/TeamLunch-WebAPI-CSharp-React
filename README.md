# TeamLunch - Sistema de Votação de Restaurantes

## Sobre o Projeto

O TeamLunch é uma API RESTful desenvolvida em .NET 8 que permite aos membros de uma equipe votarem em seus restaurantes favoritos para o almoço. O sistema inclui um serviço em segundo plano que processa os votos semanalmente e define o restaurante vencedor.

## Funcionalidades Principais

- Cadastro e gerenciamento de usuários
- Cadastro e listagem de restaurantes
- Sistema de votação diária (um voto por usuário por dia)
- Processamento semanal automático para definir o restaurante vencedor
- Histórico de restaurantes vencedores
- Documentação da API via Swagger

## Tecnologias Utilizadas

- .NET 8.0
- Entity Framework Core 8.0
- SQL Server
- Swagger/OpenAPI
- C# 12

## Pré-requisitos

- .NET 8.0 SDK
- SQL Server (LocalDB, SQL Server Express ou Azure SQL)
- Visual Studio 2022 ou Visual Studio Code

## Como Executar o Projeto

1. **Configuração do Banco de Dados**
   - Crie um banco de dados SQL Server
   - Atualize a string de conexão no arquivo `appsettings.json`

2. **Executando as Migrações**
   ```bash
   dotnet ef database update --project TeamLunch.API
   ```

3. **Executando a Aplicação**
   ```bash
   dotnet run --project TeamLunch.API
   ```

4. **Acessando a Documentação**
   - Acesse `https://localhost:PORT/swagger` para visualizar e testar os endpoints da API

## Estrutura do Projeto

- `Controllers/`: Contém os controladores da API
- `Models/`: Entidades do domínio
- `Services/`: Lógica de negócios
- `Interfaces/`: Contratos dos serviços
- `Context/`: Configuração do Entity Framework
- `BackgroundServices/`: Serviços em segundo plano
- `Migrations/`: Migrações do banco de dados

## Pontos de Destaque do Código

1. **Arquitetura Limpa**
   - Separação clara de responsabilidades entre camadas
   - Injeção de dependência para baixo acoplamento
   - Interfaces bem definidas para os serviços

2. **Tratamento de Erros**
   - Middleware global para tratamento de exceções
   - Respostas padronizadas para erros

3. **Performance**
   - Operações assíncronas para melhor escalabilidade
   - Índices otimizados no banco de dados

4. **Segurança**
   - Validação de entrada em todos os endpoints
   - Prevenção contra votos duplicados

## Melhorias Futuras

1. **Autenticação e Autorização**
   - Implementar autenticação JWT
   - Controle de acesso baseado em papéis (RBAC)

2. **Testes**
   - Adicionar testes unitários
   - Implementar testes de integração
   - Configurar CI/CD

3. **Escalabilidade**
   - Adicionar cache para consultas frequentes
   - Implementar filas para processamento assíncrono

4. **Monitoramento**
   - Adicionar logs estruturados
   - Integrar com ferramentas de monitoramento
   - Métricas de uso da API

5. **Interface do Usuário**
   - Desenvolver frontend em React
   - Dashboard para visualização de resultados

## Considerações Finais

Este projeto demonstra boas práticas de desenvolvimento de APIs RESTful com .NET, incluindo arquitetura limpa, injeção de dependência e processamento em segundo plano. A estrutura modular facilita a manutenção e a evolução do sistema. O código segue os princípios SOLID e está preparado para escalar conforme necessário.