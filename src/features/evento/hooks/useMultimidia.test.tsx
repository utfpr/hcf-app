import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { pick } from '@react-native-documents/picker'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'

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

describe('useMultimidia: aviso de fila', () => {
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

describe('useMultimidia: gravação de áudio', () => {
  // A instância criada pelo módulo do hook (o mock está em jest.setup.js)
  const gravador = (AudioRecorderPlayer as unknown as jest.Mock).mock.results[0].value as Record<string, jest.Mock>

  beforeEach(() => {
    gravador.startRecorder.mockReset().mockResolvedValue('file:///gravando.mp4')
    gravador.stopRecorder.mockReset().mockResolvedValue('file:///data/audio.mp4')
  })

  async function tocar(estado: () => MultimidiaState) {
    await ReactTestRenderer.act(async () => {
      await estado().alternarGravacao()
    })
  }

  it('grava e põe o áudio na fila', async () => {
    const { toast, estado } = montar()

    await tocar(estado)
    expect(estado().isRecording).toBe(true)

    await tocar(estado)
    expect(estado().isRecording).toBe(false)
    expect(estado().pendentes).toHaveLength(1)
    expect(estado().pendentes[0].payload.arquivo.uri).toBe('file:///data/audio.mp4')
    expect(toast).toHaveBeenCalledWith({ tipo: 'info', titulo: 'Áudio (00:00) adicionado à fila' })
  })

  it('dois toques rápidos em "Parar" param uma vez só', async () => {
    const { estado } = montar()
    await tocar(estado)

    await ReactTestRenderer.act(async () => {
      const parar = estado().alternarGravacao
      await Promise.all([parar(), parar()])
    })

    expect(gravador.stopRecorder).toHaveBeenCalledTimes(1)
    expect(estado().pendentes).toHaveLength(1)
    expect(estado().isRecording).toBe(false)
  })

  it('resposta que não é arquivo ("Already stopped") não vira anexo', async () => {
    const { estado } = montar()
    await tocar(estado)
    gravador.stopRecorder.mockResolvedValueOnce('Already stopped')

    await tocar(estado)

    expect(estado().pendentes).toHaveLength(0)
    expect(estado().isRecording).toBe(false)
    expect(estado().error).toBe('Não foi possível salvar a gravação. Tente novamente.')
  })

  it('falha ao parar não deixa a tela presa em "gravando"', async () => {
    const { estado } = montar()
    await tocar(estado)
    gravador.stopRecorder.mockRejectedValueOnce(new Error('stop failed'))

    await tocar(estado)

    expect(estado().isRecording).toBe(false)
    expect(estado().pendentes).toHaveLength(0)
    expect(estado().error).toBe('Não foi possível salvar a gravação. Tente novamente.')
  })

  it('falha ao iniciar avisa e libera para tentar de novo', async () => {
    const { estado } = montar()
    gravador.startRecorder.mockRejectedValueOnce(new Error('mic ocupado'))

    await tocar(estado)

    expect(estado().isRecording).toBe(false)
    expect(estado().error).toBe('Não foi possível iniciar a gravação. Verifique o microfone e tente novamente.')

    await tocar(estado)
    expect(estado().isRecording).toBe(true)
  })
})
