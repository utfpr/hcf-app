# Navegação do App

## O que faz

A navegação controla qual tela aparece e como o usuário passa de uma tela para outra. Ela separa o app em duas partes:

- **Usuário não logado:** só a tela de **Login** fica disponível.
- **Usuário logado:** abre direto na tela **Início** e libera as demais telas do app.

Quando o usuário faz login ou sai da conta, o app troca de parte sozinho. Ao abrir o app, enquanto ele confere se já existe uma sessão salva, aparece um indicador de carregamento.

## Telas do app

- **Login:** entrada no app.
- **Início:** tela inicial do usuário logado.
- **Expedições:** lista de expedições.
- **Detalhe da expedição:** informações e registros de uma expedição.
- **Formulário de evidências:** cadastro de registro de coleta ou de diário, ligado a uma expedição.
- **Lembretes:** lista de todos os lembretes.
- **Formulário de lembrete:** criação de um lembrete, que pode estar ligado a uma expedição.
- **Sincronização:** envio para o servidor das alterações feitas sem internet.
- **Perfil do usuário:** dados de quem está logado.

## Menu de navegação (`NavigationMenu`)

**Arquivo:** `src/features/navigation/NavigationMenu.tsx`

É o menu que abre quando o usuário toca no botão de menu, no canto superior esquerdo das telas principais. Ele aparece logo abaixo do cabeçalho, por cima do conteúdo, e tem os itens:

- **Início**
- **Expedições**
- **Sincronização:** mostra um contador com a quantidade de alterações que ainda não foram enviadas ao servidor.
- **Todos Lembretes**
- **Perfil do Usuário**

A tela em que o usuário está fica destacada no menu. Tocar em um item leva para aquela tela, e tocar fora do menu (ou no botão voltar do Android) fecha o menu.

## Arquivos

- **`src/navigation/index.tsx`:** decide se mostra a parte de login ou a parte do usuário logado.
- **`src/navigation/AuthNavigator.tsx`:** telas de quem não está logado (Login).
- **`src/navigation/AppNavigator.tsx`:** telas de quem está logado. Também repassa para os formulários de evidência e de lembrete a expedição de onde eles foram abertos.
- **`src/navigation/types.ts`:** lista as telas do app e as informações que cada uma recebe ao ser aberta (por exemplo, a tela de detalhe recebe o id da expedição).
