import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ArrowLeft, Check, ChevronDown, Clock, Image as ImageIcon, MapPin, Mic, Play, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EvidenceMode } from '@/navigation/types';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export interface FormularioProps {
  mode: EvidenceMode;
  latitude: number;
  longitude: number;
}

interface ImageAsset { uri: string; name: string; sizeLabel: string }
interface AudioAsset { uri: string; durationLabel: string }

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

export function Formulario({ mode, latitude, longitude }: FormularioProps) {
  const navigation = useNavigation();
  const config = MODE_CONFIG[mode];
  const isCollection = mode === 'collection';

  const agora = new Date();
  const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;

  const [family, setFamily] = useState<string | null>(null);
  const [isFamilyListVisible, setIsFamilyListVisible] = useState(false);
  const [scientificName, setScientificName] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [audio, setAudio] = useState<AudioAsset | null>(null);

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
      sizeLabel: formatFileSize(asset.fileSize),
    });
  }

  // integrar com react-native-audio-recorder-player
  function handleRecordAudio() {
    setAudio({ uri: '', durationLabel: '0:14' });
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
                accessibilityLabel="Selecionar família"
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
            <TouchableOpacity style={styles.mediaButton} onPress={handleRecordAudio}>
              <Mic size={16} color={colors.onAccent} />
              <Text style={styles.mediaButtonText}>Áudio</Text>
            </TouchableOpacity>
          </View>

          {imageError ? <Text style={styles.mediaError}>{imageError}</Text> : null}

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
              <View style={styles.audioPlayIcon}>
                <Play size={14} color={colors.textSecondary} />
              </View>
              <View style={styles.waveform}>
                {[8, 14, 6, 16, 10, 18, 9, 13].map((height, index) => (
                  <View key={index} style={[styles.waveformBar, { height }]} />
                ))}
              </View>
              <Text style={styles.previewMeta}>{audio.durationLabel}</Text>
              <TouchableOpacity onPress={() => setAudio(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton}>
        <Check size={18} color={colors.onAccent} />
        <Text style={styles.saveButtonText}>{config.saveLabel}</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}