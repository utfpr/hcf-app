import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Platform, PermissionsAndroid, ActivityIndicator, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import DocumentPicker, { types } from '@react-native-documents/picker';
import { ArrowLeft, Check, ChevronDown, Clock, Camera as CameraIcon, MapPin, Mic, Play, Pause, Video as VideoIcon, Upload as UploadIcon, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { EvidenceMode } from '@/navigation/types';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export interface FormularioProps {
  mode: EvidenceMode;
  latitude: number;
  longitude: number;
}

interface UploadAsset { uri: string; name: string; type: string; sizeLabel: string; }
interface AudioAsset { uri: string; durationLabel: string; }

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

const audioRecorderPlayer = new AudioRecorderPlayer();

export function Formulario({ mode, latitude, longitude }: FormularioProps) {
  const navigation = useNavigation();
  const config = MODE_CONFIG[mode];
  const isCollection = mode === 'collection';

  const [agora] = useState(() => new Date());
  const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;

  const [family, setFamily] = useState<string | null>(null);
  const [isFamilyListVisible, setIsFamilyListVisible] = useState(false);
  const [scientificName, setScientificName] = useState('');
  const [notes, setNotes] = useState('');

  // Estados de Mídia
  const [uploads, setUploads] = useState<UploadAsset[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [audio, setAudio] = useState<AudioAsset | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');

  useEffect(() => {
    return () => {
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  async function checkPermissions() {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        return (
          grants['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  async function handleOpenCameraMenu() {
      setMediaError(null);
      const hasPermission = await checkPermissions();

      if (!hasPermission) {
        setMediaError('Permissão de câmera/microfone negada.');
        return;
      }

      Alert.alert(
        'Câmera',
        'O que você deseja capturar?',
        [
          { text: 'Tirar Foto', onPress: () => launchNativeCamera('photo') },
          { text: 'Gravar Vídeo', onPress: () => launchNativeCamera('video') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }

    async function launchNativeCamera(mediaType: 'photo' | 'video') {
      const result = await launchCamera({
        mediaType,
        saveToPhotos: true,
        videoQuality: 'high'
      });

      if (result.didCancel) return;
      const asset = result.assets?.[0];

      if (result.errorCode || !asset?.uri) {
        setMediaError(`Não foi possível capturar o ${mediaType === 'photo' ? 'imagem' : 'vídeo'}.`);
        return;
      }

      // Salva no estado genérico de uploads que já criamos antes
      setUploads(prev => [...prev, {
        uri: asset.uri!,
        name: asset.fileName ?? `captura_${Date.now()}.${mediaType === 'photo' ? 'jpg' : 'mp4'}`,
        type: asset.type ?? (mediaType === 'photo' ? 'image/jpeg' : 'video/mp4'),
        sizeLabel: formatFileSize(asset.fileSize),
      }]);
    }

  // 2. Gravação de Áudio
  async function handleToggleRecord() {
    if (isRecording) {
      const resultUri = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setAudio({ uri: resultUri, durationLabel: recordTime });
    } else {
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) return;

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

  // 3. Upload Múltiplo (Galeria/Arquivos)
  async function handleUploadMedia() {
    try {
      const results = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: [types.images, types.video, types.audio],
      });

      const newUploads = results.map(file => ({
        uri: file.uri,
        name: file.name ?? `upload_${Date.now()}`,
        type: file.type ?? 'application/octet-stream',
        sizeLabel: formatFileSize(file.size ?? 0),
      }));

      setUploads(prev => [...prev, ...newUploads]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        setMediaError('Erro ao realizar upload.');
      }
    }
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
                          onPress={() => { setFamily(option); setIsFamilyListVisible(false); }}
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

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                {/* Botão atualizado para chamar o menu de opções (Foto/Vídeo) */}
                <TouchableOpacity style={[styles.mediaButton, { flex: 1 }]} onPress={handleOpenCameraMenu}>
                  <CameraIcon size={16} color="#FFFFFF" />
                  <Text style={styles.mediaButtonText}>Câmera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mediaButton, { flex: 1 }]} onPress={handleUploadMedia}>
                  <UploadIcon size={16} color="#FFFFFF" />
                  <Text style={styles.mediaButtonText}>Uploads</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mediaButton, { flex: 1 }, isRecording && { backgroundColor: '#d32f2f' }]}
                  onPress={handleToggleRecord}
                  disabled={!!audio && !isRecording}
                >
                  <Mic size={16} color="#FFFFFF" />
                  <Text style={styles.mediaButtonText}>
                    {isRecording ? `Gravando... ${recordTime}` : 'Áudio'}
                  </Text>
                </TouchableOpacity>
              </View>

              {mediaError ? <Text style={styles.mediaError}>{mediaError}</Text> : null}

              {/* Preview de Áudio */}
              {audio && (
                <View style={styles.previewRow}>
                  <TouchableOpacity style={styles.audioPlayIcon} onPress={handleTogglePlay} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    {isPlaying ? <Pause size={14} color={colors.textSecondary} /> : <Play size={14} color={colors.textSecondary} />}
                  </TouchableOpacity>
                  <View style={styles.waveform}>
                    {[8,14,6,16,10,18,9,13].map((height, index) => (
                      <View key={index} style={[styles.waveformBar, { height, backgroundColor: isPlaying ? '#0288d1' : colors.placeholder }]} />
                    ))}
                  </View>
                  <Text style={styles.previewMeta}>{audio.durationLabel}</Text>
                  <TouchableOpacity onPress={() => { if (isPlaying) handleTogglePlay(); setAudio(null); setRecordTime('00:00'); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Preview de Múltiplos Uploads / Câmera */}
              {uploads.map((upload, index) => (
                <View key={index} style={styles.previewRow}>
                  {upload.type.includes('image') ? (
                    <Image source={{ uri: upload.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.previewThumb}>
                      {upload.type.includes('video') ? <VideoIcon size={18} color={colors.textSecondary} /> : <UploadIcon size={18} color={colors.textSecondary} />}
                    </View>
                  )}
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName} numberOfLines={1}>{upload.name}</Text>
                    <Text style={styles.previewMeta}>{upload.sizeLabel}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setUploads(prev => prev.filter((_, i) => i !== index))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}

            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton}>
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{config.saveLabel}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }