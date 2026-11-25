# Tela de Formulário de Evidências

**Arquivo principal:** `src/features/evidenceForm/evidenceForm.tsx`

## O que a tela faz

Esta tela registra uma evidência vinculada a uma expedição. Ela possui dois modos:

- **Registro de coleta:** permite preencher a ficha botânica, o número da coleta, família, local, observações e mídias.
- **Registro de diário:** permite registrar uma descrição do que foi observado em campo e associar mídias.

O preenchimento é salvo como rascunho no aparelho. Ao tocar em **Salvar**, o registro entra na fila de sincronização, portanto a tela continua funcionando sem internet.

## Como usar

1. Abra uma expedição e escolha adicionar uma coleta ou um registro de diário.
2. Confira a localização e a data/hora mostradas no topo.
3. Para uma coleta, preencha os campos da ficha. O número sugerido é o próximo disponível da expedição.
4. Adicione observações e, se necessário, fotos, vídeos ou áudios.
5. Toque em **Salvar Coleta** ou **Salvar Diário**.
6. Quando houver conexão, use a tela **Sincronização** para enviar os registros ao servidor.

## Componentes presentes na tela

| Componente | Função |
| --- | --- |
| Cabeçalho com seta de voltar | Retorna à tela anterior; se houver alterações não salvas, pede confirmação. |
| `OfflineBanner` | Informa que o aparelho está sem internet, sem impedir o salvamento local. |
| `LocalizacaoChip` | Exibe o estado da localização usada no registro. |
| Chip de data e hora | Mostra a data e a hora associadas à evidência. |
| `RascunhoBanner` | Informa que um rascunho anterior foi recuperado e permite descartá-lo. |
| `CardFicha` | Agrupa visualmente cada seção da ficha de coleta. |
| `FamiliaInput` | Campo de família taxonômica com busca de sugestões. |
| `LocalColetaInput` | Sugere locais cadastrados na expedição e pode preencher município e estado. |
| `OpcoesChips` | Botões para selecionar opções da ficha. |
| Campo de observações/descrição | Guarda informações complementares da coleta ou o texto do diário. |
| `CardMidiasAssociadas` | Lista os anexos para revisão antes do salvamento. |
| `RodapeAcoes` | Permite anexar mídias, salvar e exibir eventuais erros. |

## Comportamentos importantes

- Um rascunho não vazio da mesma expedição e do mesmo tipo de registro é restaurado automaticamente.
- O número da coleta é sugerido automaticamente. Se o usuário informar um número existente, a tela avisa que ficha e evidências serão reunidas na mesma coleta.
- No modo diário, os campos exclusivos de coleta não são exibidos.
- O botão de salvar fica indisponível enquanto não há expedição válida, o registro está sendo salvo ou uma mídia está sendo processada.
- Depois do salvamento, o rascunho é apagado e a tela retorna para a anterior.

## Arquivos relacionados

- `src/features/evidenceForm/evidenceForm.tsx`: controla o estado, rascunho, payload e salvamento.
- `src/features/evidenceForm/CardFicha.tsx`: estrutura visual reutilizada pelas seções.
- `src/features/evidenceForm/LocalColetaInput.tsx`: busca e seleção do local de coleta.
- `src/features/evidenceForm/OpcoesChips.tsx`: seleção das opções categóricas.
- `src/features/evidenceForm/CardMidiasAssociadas.tsx`: revisão das mídias selecionadas.
- `src/features/evento/hooks/useRegistrarEvento.ts`: adiciona a evidência à fila de sincronização.
- `src/features/offline/useRascunho.ts`: persiste e restaura o preenchimento não finalizado.
