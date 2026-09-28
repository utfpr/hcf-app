import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ArrowLeft, Check, ChevronDown, Clock, Image as ImageIcon, MapPin, Mic, Play, Pause, Video as VideoIcon, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useRegistrarEvento } from '@/features/evento/hooks/useRegistrarEvento';
import type { CriarEventoPayload, CriarEvidenciaPayload } from '@/features/evento/types';
import { getUserFacingHttpError } from '@/libraries/http/httpError';
import { EvidenceMode, RootStackParamList } from '@/navigation/types';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export interface FormularioProps {
  // Todo evento pertence a uma expedição na API; sem ela o formulário não salva.
  expedicaoId?: number;
  mode: EvidenceMode;
  latitude: number;
  longitude: number;
}

interface ImageAsset { uri: string; name: string; type: string; sizeLabel: string; capturadoEm: string }
interface AudioAsset { uri: string; durationLabel: string; capturadoEm: string }
interface VideoAsset { uri: string; name: string; type: string; sizeLabel: string; durationLabel?: string; capturadoEm: string }

interface ModeConfig {
  title: string;
  notesLabel: string;
  notesPlaceholder: string;
  saveLabel: string;
}

const MODE_CONFIG: Record<EvidenceMode, ModeConfig> = {
  collection: {
    title: 'Registro de Coleta',
    notesLabel: 'Observações',
    notesPlaceholder: 'Detalhes adicionais da coleta...',
    saveLabel: 'Salvar Coleta',
  },
  diary: {
    title: 'Registro de Diário',
    notesLabel: 'Anotação',
    notesPlaceholder: 'Descreva o que foi observado em campo...',
    saveLabel: 'Salvar Diário',
  },
};

const FAMILY_OPTIONS = ['Acanthaceae', 'Asteraceae', 'Bromeliaceae', 'Fabaceae', 'Myrtaceae', 'Orchidaceae', 'Rubiaceae'];

function formatFileSize(size?: number) {
  if (!size) return 'Tamanho não disponível';
  return size < 1024 ? String(size) + ' B' : (size / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDuration(seconds?: number) {
  if (seconds === undefined) return undefined;
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

export function Formulario({ expedicaoId, mode, latitude, longitude }: FormularioProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Formulario'>>();
  const config = MODE_CONFIG[mode];
  const isCollection = mode === 'collection';

  // Instante da captura: fixado na abertura do formulário para não mudar a cada render.
  const [capturadoEm] = useState(() => new Date());
  const dataHora = `${capturadoEm.toLocaleDateString('pt-BR')} ${capturadoEm.toLocaleTimeString('pt-BR')}`;

  const [family, setFamily] = useState<string | null>(null);
  const [isFamilyListVisible, setIsFamilyListVisible] = useState(false);
  const [scientificName, setScientificName] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [audio, setAudio] = useState<AudioAsset | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');

  const [video, setVideo] = useState<VideoAsset | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);

  const { trigger: registrar, loading: isSaving } = useRegistrarEvento(expedicaoId);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  async function handleAddImage() {
    setImageError(null);
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
    if (result.didCancel) return;
    const asset = result.assets?.[0];
    if (result.errorCode || !asset?.uri) {
      setImageError('Não foi possível selecionar a imagem. Tente novamente.');
      return;
    }
    setImage({
      uri: asset.uri,
      name: asset.fileName ?? 'imagem_coleta.jpg',
      type: asset.type ?? 'image/jpeg',
      sizeLabel: formatFileSize(asset.fileSize),
      capturadoEm: new Date().toISOString(),
    });
  }

  async function checkCameraPermission() {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return grants['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  async function handleAddVideo() {
    setVideoError(null);

    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      setVideoError('Permissão de câmera negada. Habilite o acesso à câmera para gravar vídeos.');
      return;
    }

    setIsCapturingVideo(true);
    try {
      const result = await launchCamera({ mediaType: 'video', videoQuality: 'high', saveToPhotos: false });
      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (result.errorCode || !asset?.uri) {
        setVideoError('Não foi possível gravar o vídeo. Tente novamente.');
        return;
      }

      setVideo({
        uri: asset.uri,
        name: asset.fileName ?? `video_${Date.now()}.mp4`,
        type: asset.type ?? 'video/mp4',
        sizeLabel: formatFileSize(asset.fileSize),
        durationLabel: formatDuration(asset.duration),
        capturadoEm: new Date().toISOString(),
      });
    } finally {
      setIsCapturingVideo(false);
    }
  }

  function handleRemoveVideo() {
    setVideo(null);
  }

  async function checkPermissions() {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  async function handleToggleRecord() {
    if (isRecording) {
      const resultUri = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setAudio({ uri: resultUri, durationLabel: recordTime, capturadoEm: new Date().toISOString() });
    } else {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;

      setIsRecording(true);
      setRecordTime('00:00');

      await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        const time = audioRecorderPlayer.mmssss(Math.floor(e.currentPosition));
        setRecordTime(time.substring(0, 5));
      });
    }
  }

  async function handleTogglePlay() {
    if (!audio?.uri) return;

    if (isPlaying) {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await audioRecorderPlayer.startPlayer(audio.uri);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition >= e.duration) {
          audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
        }
      });
    }
  }

  function handleRemoveAudio() {
    if (isPlaying) {
      audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
    }
    setAudio(null);
    setRecordTime('00:00');
  }

  function buildEventoPayload(): CriarEventoPayload {
    const observacoes = notes.trim() || null;
    const base = { capturado_em: capturadoEm.toISOString(), latitude, longitude, observacoes };

    if (!isCollection) return { ...base, tipo: 'DIARIO' };

    return {
      ...base,
      tipo: 'COLETA',
      coleta: { familia: family, nome_cientifico: scientificName.trim() || null },
    };
  }

  function buildEvidencias(): CriarEvidenciaPayload[] {
    const evidencias: CriarEvidenciaPayload[] = [];

    if (image) {
      evidencias.push({
        arquivo: { uri: image.uri, name: image.name, type: image.type },
        nome: image.name,
        capturado_em: image.capturadoEm,
      });
    }

    if (audio) {
      // O gravador salva AAC em container MP4 (sound.mp4 no Android, sound.m4a no iOS).
      const extensao = audio.uri.endsWith('.m4a') ? 'm4a' : 'mp4';
      const nome = `audio_${Date.now()}.${extensao}`;
      evidencias.push({
        arquivo: { uri: audio.uri, name: nome, type: 'audio/mp4' },
        nome,
        capturado_em: audio.capturadoEm,
      });
    }

    if (video) {
      evidencias.push({
        arquivo: { uri: video.uri, name: video.name, type: video.type },
        nome: video.name,
        capturado_em: video.capturadoEm,
      });
    }

    return evidencias;
  }

  async function handleSave() {
    if (!expedicaoId || isSaving || isRecording || isCapturingVideo) return;

    if (isPlaying) {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
    }

    setSaveError(null);
    try {
      await registrar(buildEventoPayload(), buildEvidencias());
    } catch (error) {
      setSaveError(getUserFacingHttpError(error, 'Não foi possível salvar o registro. Tente novamente.'));
      return;
    }

    Alert.alert(
      isCollection ? 'Coleta salva' : 'Diário salvo',
      'O registro foi salvo na expedição.',
      [{ text: 'OK', onPress: () => navigation.popTo('ExpeditionDetail', { expeditionId: String(expedicaoId) }) }],
      { cancelable: false },
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        <View style={styles.header}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{config.title}</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
          </View>
          <View style={styles.metaChip}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{dataHora}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {isCollection && (
              <>
                <Text style={styles.labelFirst}>Família</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setIsFamilyListVisible(v => !v)}
                  accessibilityRole="button"
                >
                  <Text style={family ? styles.selectValue : styles.selectPlaceholder}>
                    {family ?? 'Selecione a família'}
                  </Text>
                  <ChevronDown color={colors.textSecondary} size={18} />
                </TouchableOpacity>
                {isFamilyListVisible && (
                  <View style={styles.optionsList}>
                    {FAMILY_OPTIONS.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={styles.option}
                        onPress={() => {
                          setFamily(option);
                          setIsFamilyListVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.label}>Nome científico</Text>
                <TextInput
                  style={styles.input}
                  value={scientificName}
                  onChangeText={setScientificName}
                  placeholder="Ex.: Euterpe edulis"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            {/* no diário, a anotação é o primeiro campo */}
            <Text style={isCollection ? styles.label : styles.labelFirst}>{config.notesLabel}</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder={config.notesPlaceholder}
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={5}
            />

            <Text style={styles.label}>Multimídia</Text>
            <View style={styles.mediaRow}>
              <TouchableOpacity style={styles.mediaButton} onPress={handleAddImage}>
                <ImageIcon size={16} color={colors.onAccent} />
                <Text style={styles.mediaButtonText}>Imagem</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mediaButton, isRecording && { backgroundColor: '#d32f2f' }]}
                onPress={handleToggleRecord}
                disabled={!!audio && !isRecording}
              >
                <Mic size={16} color={colors.onAccent} />
                <Text style={styles.mediaButtonText}>
                  {isRecording ? `Gravando... ${recordTime}` : 'Áudio'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaButton}
                onPress={handleAddVideo}
                disabled={isCapturingVideo}
              >
                {isCapturingVideo ? (
                  <ActivityIndicator color={colors.onAccent} size="small" />
                ) : (
                  <VideoIcon size={16} color={colors.onAccent} />
                )}
                <Text style={styles.mediaButtonText}>Vídeo</Text>
              </TouchableOpacity>
            </View>

            {imageError ? <Text style={styles.mediaError}>{imageError}</Text> : null}
            {videoError ? <Text style={styles.mediaError}>{videoError}</Text> : null}

            {image && (
              <View style={styles.previewRow}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName} numberOfLines={1}>{image.name}</Text>
                  <Text style={styles.previewMeta}>{image.sizeLabel}</Text>
                </View>
                <TouchableOpacity onPress={() => setImage(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {audio && (
              <View style={styles.previewRow}>
                <TouchableOpacity style={styles.audioPlayIcon} onPress={handleTogglePlay} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {isPlaying ? <Pause size={14} color={colors.textSecondary} /> : <Play size={14} color={colors.textSecondary} />}
                </TouchableOpacity>
                <View style={styles.waveform}>
                  {[8, 14, 6, 16, 10, 18, 9, 13].map((height, index) => (
                    <View key={index} style={[styles.waveformBar, { height, backgroundColor: isPlaying ? '#0288d1' : colors.placeholder }]} />
                  ))}
                </View>
                <Text style={styles.previewMeta}>{audio.durationLabel}</Text>
                <TouchableOpacity onPress={handleRemoveAudio} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {video && (
              <View style={styles.previewRow}>
                <View style={styles.previewThumb}>
                  <VideoIcon size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName} numberOfLines={1}>{video.name}</Text>
                  <Text style={styles.previewMeta}>
                    {video.durationLabel ? `${video.durationLabel} • ${video.sizeLabel}` : video.sizeLabel}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleRemoveVideo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {!expedicaoId ? (
          <Text style={styles.saveError}>Abra o formulário a partir de uma expedição para poder salvar.</Text>
        ) : saveError ? (
          <Text style={styles.saveError}>{saveError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, (!expedicaoId || isSaving || isRecording || isCapturingVideo) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!expedicaoId || isSaving || isRecording || isCapturingVideo}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Check size={18} color={colors.onAccent} />
          )}
          <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : config.saveLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}