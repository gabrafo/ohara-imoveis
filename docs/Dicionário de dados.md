# Dicionário de Dados - Sistema Ohara Imóveis

## Tabela: feature_type

Armazena os tipos de características/recursos que um imóvel pode possuir (ex: piscina, churrasqueira, etc).

| Coluna | Tipo | Obrigatório | Valor Padrão | Restrição | Descrição |
|--------|------|-------------|--------------|-----------|-----------|
| featureId | Integer | Sim | Auto incremento | Chave Primária | Identificador único do tipo de característica |
| name | Varchar | Sim | - | - | Nome da característica (ex: "Piscina", "Churrasqueira") |
| unit | Varchar | Não | - | - | Unidade de medida, se aplicável (ex: "m²") |
| allowsQuantity | Boolean | Sim | false | - | Indica se a característica pode ter quantidade específica |

## Tabela: owner

Armazena informações sobre os proprietários dos imóveis.

| Coluna | Tipo | Obrigatório | Valor Padrão | Restrição | Descrição |
|--------|------|-------------|--------------|-----------|-----------|
| ownerId | Integer | Sim | Auto incremento | Chave Primária | Identificador único do proprietário |
| name | Varchar | Sim | - | - | Nome completo do proprietário |
| contactPhone | Varchar | Sim | - | - | Número de telefone de contato |
| cpf | Varchar | Não | - | - | CPF do proprietário (opcional) |

## Tabela: property

Armazena informações sobre os imóveis disponíveis.

| Coluna | Tipo | Obrigatório | Valor Padrão | Restrição | Descrição |
|--------|------|-------------|--------------|-----------|-----------|
| propertyId | Integer | Sim | Auto incremento | Chave Primária | Identificador único do imóvel |
| price | Numeric | Sim | - | - | Valor do imóvel em reais |
| status | Enum | Sim | 'AVAILABLE' | - | Status do imóvel (AVAILABLE, UNAVAILABLE, PENDING, CONCLUDED) |
| offerType | Enum | Sim | - | - | Tipo de oferta (FOR_RENTAL, FOR_SALE, FOR_COMMERCIAL_RENT) |
| area | Numeric | Sim | - | - | Área total do imóvel em metros quadrados |
| registrationDate | Timestamp | Sim | - | - | Data de registro do imóvel no sistema |
| ownerId | Integer | Não | - | Chave Estrangeira | Referência ao proprietário do imóvel |
| addressZipcode | Varchar | Sim | - | - | CEP do endereço do imóvel |
| addressNeighborhood | Varchar | Sim | - | - | Bairro do imóvel |
| addressNumber | Integer | Sim | - | - | Número do imóvel |
| addressStreet | Varchar | Sim | - | - | Rua/logradouro do imóvel |
| addressCity | Varchar | Sim | - | - | Cidade do imóvel |
| addressState | Enum | Sim | - | - | Estado (UF) do imóvel |
| addressComplement | Varchar | Não | - | - | Complemento do endereço (apto, bloco, etc) |

## Tabela: property_feature

Relaciona imóveis com suas características específicas.

| Coluna | Tipo | Obrigatório | Valor Padrão | Restrição | Descrição |
|--------|------|-------------|--------------|-----------|-----------|
| propertyFeatureId | Integer | Sim | Auto incremento | Chave Primária | Identificador único da característica do imóvel |
| quantity | Integer | Não | - | - | Quantidade da característica (ex: número de quartos) |
| details | Varchar | Não | - | - | Detalhes adicionais sobre a característica |
| propertyPropertyId | Integer | Não | - | Chave Estrangeira | Referência ao imóvel |
| featureTypeId | Integer | Não | - | Chave Estrangeira | Referência ao tipo de característica |

## Tabela: user

Armazena informações dos usuários do sistema.

| Coluna | Tipo | Obrigatório | Valor Padrão | Restrição | Descrição |
|--------|------|-------------|--------------|-----------|-----------|
| userId | Integer | Sim | Auto incremento | Chave Primária | Identificador único do usuário |
| name | Varchar | Sim | - | - | Nome completo do usuário |
| birthDate | Date | Sim | - | - | Data de nascimento do usuário |
| email | Varchar | Sim | - | Único | Email do usuário (usado para login) |
| password | Varchar | Sim | - | - | Senha criptografada do usuário |
| phone | Varchar | Sim | - | Único | Número de telefone do usuário |
| role | Enum | Sim | 'CUSTOMER' | - | Papel do usuário no sistema (CUSTOMER, BROKER, ADMIN) |
| tokenVersion | Integer | Sim | 1 | - | Versão do token para controle de sessões |

## Tabela: visit

Armazena informações sobre visitas agendadas aos imóveis.

| Coluna | Tipo | Obrigatório | Valor Padrão | Restrição | Descrição |
|--------|------|-------------|--------------|-----------|-----------|
| visitId | Integer | Sim | Auto incremento | Chave Primária | Identificador único da visita |
| visitDateTime | Timestamp | Sim | - | - | Data e hora agendada para a visita |
| visitStatus | Enum | Sim | 'SCHEDULED' | - | Status da visita (SCHEDULED, CANCELED, DONE) |
| propertyPropertyId | Integer | Não | - | Chave Estrangeira | Referência ao imóvel a ser visitado |
| userId | Integer | Não | - | Chave Estrangeira | Referência ao usuário que agendou a visita |

## Legenda

- **Chave Primária**: Identifica unicamente cada registro na tabela
- **Chave Estrangeira**: Estabelece relacionamento com outra tabela
- **Único**: Valor deve ser único em toda a tabela