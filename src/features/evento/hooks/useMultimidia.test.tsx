import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { pick } from '@react-native-documents/picker'

import { FeedbackContext } from '@/components/feedback/FeedbackContext'

import { type EvidenciaPendente, mensagemAnexosNaFila, type MultimidiaState, useMultimidia } from './useMultimidia'

describe('mensagemAnexosNaFila', () => {
  it('descreve o que entrou na fila', () => {
    expect(mensagemAnexosNaFila([])).toBeNull()
    expect(mensagemAnexosNaFila([{ tipo: 'audio', detalhe: '00:42' }])).toBe('Áudio (00:42) adicionado à fila')
    expect(mensagemAnexosNaFila([{ tipo: 'imagem', detalhe: '1 MB' }])).toBe('Foto adicionada à fila')
    expect(mensagemAnexosNaFila([{ tipo: 'video', detalhe: '3 MB' }])).toBe('Vídeo adicionado à fila')
    expect(mensagemAnexosNaFila([{ tipo: 'outro', detalhe: '2 KB' }])).toBe('Arquivo adicionado à fila')
    expect(mensagemAnexosNaFila([
      { tipo: 'imagem', detalhe: '1 MB' },
      { tipo: 'imagem', detalhe: '1 MB' },
      { tipo: 'outro', detalhe: '2 KB' },
    ])).toBe('3 anexos adicionados à fila')
  })
})

describe('useMultimidia: aviso de fila', () => {
  function montar() {
    const toast = jest.fn()
    const ref: { atual?: MultimidiaState } = {}
    function Teste() {
      ref.atual = useMultimidia()
      return null
    }
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <FeedbackContext.Provider value={{ toast, dialogo: jest.fn() }}>
          <Teste />
        </FeedbackContext.Provider>,
      )
    })
    return { toast, estado: () => ref.atual as MultimidiaState }
  }

  const video: EvidenciaPendente = {
    id: 'video-1',
    tipo: 'video',
    detalhe: '3 MB',
    validandoDuracao: true,
    payload: { nome: 'video.mp4', data_captura: '2026-11-16T10:00:00.000Z', arquivo: { uri: 'file:///v.mp4', name: 'v.mp4', type: 'video/mp4' } },
  }

  it('vídeo rejeitado por duração não avisa', () => {
    const { toast, estado } = montar()
    ReactTestRenderer.act(() => estado().setPendentes([video]))

    ReactTestRenderer.act(() => estado().validarDuracaoVideo('video-1', 61))

    expect(toast).not.toHaveBeenCalled()
  })

  it('vídeo aceito avisa', () => {
    const { toast, estado } = montar()
    ReactTestRenderer.act(() => estado().setPendentes([video]))

    ReactTestRenderer.act(() => estado().validarDuracaoVideo('video-1', 30))

    expect(toast).toHaveBeenCalledWith({ tipo: 'info', titulo: 'Vídeo adicionado à fila' })
  })

  it('upload de vários arquivos avisa uma vez', async () => {
    const { toast, estado } = montar()
    ;(pick as jest.Mock).mockResolvedValueOnce([1, 2, 3].map(n => ({
      uri: `content://foto-${n}`, name: `foto-${n}.jpg`, type: 'image/jpeg', size: 2048,
    })))

    await ReactTestRenderer.act(async () => {
      await estado().upload()
    })

    expect(toast).toHaveBeenCalledTimes(1)
    expect(toast).toHaveBeenCalledWith({ tipo: 'info', titulo: '3 anexos adicionados à fila' })
  })
})
