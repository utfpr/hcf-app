import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, Camera, Mic, ArrowLeft, X, Play, Check, Image as ImageIcon } from 'lucide-react-native';
import { TextInputField } from '../../component/form/TextInputField';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export interface FormularioProps {
  latitude: number;
  longitude: number;
}

interface PhotoAsset {
  uri: string;
  name: string;
  sizeLabel: string;
}

interface AudioAsset {
  uri: string;
  durationLabel: string;
}

export function Formulario({ latitude, longitude }: FormularioProps) {

  const agora = new Date();
  const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [audio, setAudio] = useState<AudioAsset | null>(null);

  // integrar com react-native-image-picker
  function handleTakePhoto() {
    setPhoto({ uri: '', name: 'foto_coleta_01.jpg', sizeLabel: '1.2 MB' });
  }

  // integrar com react-native-audio-recorder-player
  function handleRecordAudio() {
    setAudio({ uri: '', durationLabel: '0:14' });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro de Coleta</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* localização e data/hora */}
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        </View>
        <View style={styles.metaChip}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{dataHora}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.formCard}>
          <TextInputField
            label="Observações"
            style={styles.textArea}
            placeholder="Detalhes adicionais da coleta..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={5}
          />

          {/* foto e audio */}
          <Text style={styles.label}>Multimídia</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaButton} onPress={handleTakePhoto}>
              <Camera size={16} color="#FFFFFF" />
              <Text style={styles.mediaButtonText}>Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={handleRecordAudio}>
              <Mic size={16} color="#FFFFFF" />
              <Text style={styles.mediaButtonText}>Áudio</Text>
            </TouchableOpacity>
          </View>

          {/* preview da foto */}
          {photo && (
            <View style={styles.previewRow}>
              <View style={styles.previewThumb}>
                <ImageIcon size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName} numberOfLines={1}>{photo.name}</Text>
                <Text style={styles.previewMeta}>{photo.sizeLabel}</Text>
              </View>
              <TouchableOpacity onPress={() => setPhoto(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* preview do audio */}
          {audio && (
            <View style={styles.previewRow}>
              <View style={styles.audioPlayIcon}>
                <Play size={14} color={colors.textSecondary} />
              </View>
              <View style={styles.waveform}>
                {[8, 14, 6, 16, 10, 18, 9, 13].map((h, i) => (
                  <View key={i} style={[styles.waveformBar, { height: h }]} />
                ))}
              </View>
              <Text style={styles.previewMeta}>{audio.durationLabel}</Text>
              <TouchableOpacity onPress={() => setAudio(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* botão de salvar */}
      <TouchableOpacity style={styles.saveButton}>
        <Check size={18} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Salvar Coleta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}