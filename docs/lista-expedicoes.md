# Tela de Lista de Expedições

**Arquivo:** `src/features/expeditionList/ExpeditionListScreen.tsx`

## O que a tela faz

Mostra as expedições do usuário em cards organizados em duas colunas. Nela dá para buscar uma expedição pelo nome ou pela cidade, filtrar pelo status e abrir os detalhes de uma expedição. A tela também funciona sem internet, porque mostra as expedições que já estão salvas no aparelho.

## Como usar

1. Abra o menu no canto superior esquerdo e toque em **Expedições**.
2. Para procurar uma expedição, digite o nome ou a cidade no campo de busca.
3. Para filtrar, toque em um dos status: **Todas**, **Em andamento**, **Planejadas** ou **Finalizadas**.
4. Role a lista para baixo para ver mais expedições. Elas vão sendo carregadas aos poucos, de 10 em 10.
5. Puxe a lista para baixo para atualizar com os dados mais recentes do servidor.
6. Toque em uma expedição para abrir a tela de detalhes.

## Componentes da tela

- **Botão de menu:** abre e fecha o menu de navegação do app.
- **Nome do usuário:** mostra quem está logado, no canto superior direito.
- **Aviso de sem internet (`OfflineBanner`):** faixa amarela que aparece só quando o aparelho está offline, avisando que tudo continua salvo no aparelho.
- **Campo de busca (`CampoBusca`):** filtra a lista pelo nome ou pela cidade da expedição, sem diferenciar maiúsculas e acentos.
- **Filtro de status (`FiltroChips`):** botões para mostrar só as expedições planejadas, em andamento ou finalizadas.
- **Card de expedição (`ExpeditionCard`):** mostra o nome, as datas e o status da expedição, e indica se ela tem alterações que ainda não foram enviadas ao servidor. Ao tocar, abre os detalhes da expedição.
- **Menu de navegação (`NavigationMenu`):** permite ir para as outras telas do app (ver [navegacao.md](./navegacao.md)).

## O que aparece em cada situação

- **Carregando:** um indicador de carregamento no meio da tela.
- **Erro ao carregar:** a mensagem "Não foi possível carregar as expedições." e um botão **Tentar Novamente**.
- **Nenhuma expedição:** a mensagem "Nenhuma expedição encontrada.", ou "Nenhuma expedição com esse filtro." quando há busca ou filtro ativo.
- **Carregando mais itens:** um pequeno indicador no fim da lista enquanto as próximas expedições aparecem.

## Arquivos de apoio

- **`useExpeditionsInfinite`** (`src/features/expedition/hooks/useExpeditionsInfinite.ts`): busca as expedições salvas no aparelho, aplica a busca e o filtro de status, controla o carregamento de 10 em 10 e atualiza os dados com o servidor.
- **`utils.ts`** (`src/features/expedition/utils.ts`): funções que formatam as datas no padrão brasileiro e calculam o status da expedição (planejada, em andamento ou finalizada) a partir das datas de início e fim.
