# Regras de Codificação do Projeto

Para garantir a qualidade, manutenibilidade e colaboração eficiente no desenvolvimento do projeto, o grupo adotará as seguintes regras de codificação, além das práticas obrigatórias de padronização de notação e documentação de código.

1. Princípio da Responsabilidade Única (SRP)
Cada classe e método deve ter um, e somente um, motivo para existir e ser modificado. O objetivo é criar componentes coesos e desacoplados, facilitando testes unitários e a manutenção futura do sistema.

2. Princípio "Don't Repeat Yourself" (DRY)
A duplicação de lógica de programação deve ser evitada. Lógicas recorrentes devem ser abstraídas em métodos ou componentes reutilizáveis para centralizar o conhecimento, reduzir a redundância e minimizar a probabilidade de erros durante alterações.

3. Decomposição de Funções
As funções devem ser concisas e possuir um objetivo único e bem definido. Funções extensas devem ser decompostas em sub-rotinas menores, melhorando a legibilidade, a testabilidade e o reuso do código.

4. Padrão de Versionamento de Código
Os commits no sistema de controle de versão (Git) devem ser atômicos, representando uma única unidade lógica de trabalho. As mensagens de commit devem seguir um padrão claro e descritivo (ex: uso do modo imperativo), garantindo um histórico de alterações limpo, rastreável e auditable.

5. Princípio do Aberto/Fechado (OCP)
Os componentes de software devem ser abertos para extensão, mas fechados para modificação. Novas funcionalidades devem ser adicionadas através da criação de novo código (ex: novas classes que implementam uma interface), em vez da alteração de código existente e já testado.

6. Uso de Constantes para Valores Literais
Valores literais fixos (conhecidos como "números mágicos" ou "strings mágicas") não devem ser embutidos diretamente no código. Em vez disso, devem ser declarados como constantes nomeadas, melhorando a legibilidade e centralizando a configuração para facilitar futuras manutenções.
