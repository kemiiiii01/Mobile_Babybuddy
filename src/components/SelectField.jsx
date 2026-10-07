import { useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from './Icon'
import { colors, fonts, radius } from '../theme'

const ROW_HEIGHT = 48

// Campo que abre uma lista de opções ({ value, label }) em um painel inferior.
// startAt: valor em que a lista abre enquanto nada foi escolhido.
export function SelectField({ label, value, placeholder, options, onChange, startAt, style }) {
  const [open, setOpen] = useState(false)
  const selectedIndex = options.findIndex(o => o.value === value)
  // Valor salvo antes de existir o seletor pode não estar na lista: mostra como está.
  const shown = selectedIndex >= 0 ? options[selectedIndex].label : value

  const startIndex = selectedIndex >= 0 ? selectedIndex : options.findIndex(o => o.value === startAt)

  function pick(option) {
    onChange(option.value)
    setOpen(false)
  }

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${shown || placeholder}`}
      >
        <Text style={[styles.value, !shown && styles.placeholder]} numberOfLines={1}>
          {shown || placeholder}
        </Text>
        <Icon name="down" color={colors.black} size={18} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <TouchableOpacity
              onPress={() => setOpen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Icon name="x" color={colors.black} size={20} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={o => String(o.value)}
            getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
            initialScrollIndex={Math.max(0, startIndex - 2)}
            renderItem={({ item }) => {
              const selected = item.value === value
              return (
                <TouchableOpacity
                  style={[styles.row, selected && styles.rowSelected]}
                  onPress={() => pick(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{item.label}</Text>
                  {selected && <Icon name="check" color={colors.primary} size={18} />}
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 14, color: colors.black, fontFamily: fonts.semiBold, marginBottom: 3 },
  field: {
    height: 44, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: radius.input,
    paddingHorizontal: 14, backgroundColor: colors.white,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  value:       { flex: 1, fontSize: 15, color: colors.black, fontFamily: fonts.regular },
  placeholder: { color: colors.blackSoft },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    maxHeight: '55%', backgroundColor: colors.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  sheetTitle: { fontSize: 16, color: colors.black, fontFamily: fonts.bold },
  row: {
    height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  rowSelected:     { backgroundColor: colors.surface },
  rowText:         { fontSize: 15, color: colors.black, fontFamily: fonts.regular },
  rowTextSelected: { fontFamily: fonts.semiBold, color: colors.primary },
})
