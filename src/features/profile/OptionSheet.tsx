import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, BottomSheet, Button, Icon } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

export type Option = { key: string; label: string };

/**
 * Single- or multi-select sheet. Single: tapping a row selects and closes. Multi: toggle rows, then Save.
 * Selection is exposed as radio/checkbox state with a check mark, never colour alone.
 */
export function OptionSheet({
  visible,
  title,
  options,
  selected,
  multi,
  onClose,
  onSubmit,
  hint,
}: {
  visible: boolean;
  title: string;
  options: Option[];
  selected: string[];
  multi?: boolean;
  onClose: () => void;
  onSubmit: (keys: string[]) => Promise<void> | void;
  hint?: string;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {hint ? <AppText variant="meta">{hint}</AppText> : null}
      {/* Body mounts fresh each time the sheet opens, so the draft seeds from the saved selection. */}
      <OptionBody options={options} selected={selected} multi={multi} onClose={onClose} onSubmit={onSubmit} />
    </BottomSheet>
  );
}

function OptionBody({
  options,
  selected,
  multi,
  onClose,
  onSubmit,
}: {
  options: Option[];
  selected: string[];
  multi?: boolean;
  onClose: () => void;
  onSubmit: (keys: string[]) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [saving, setSaving] = useState(false);

  const submit = async (keys: string[]) => {
    setSaving(true);
    try {
      await onSubmit(keys);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <View>
        {options.map((o, i) => {
          const on = draft.includes(o.key);
          return (
            <Pressable
              key={o.key}
              accessibilityRole={multi ? 'checkbox' : 'radio'}
              accessibilityLabel={o.label}
              aria-checked={on}
              onPress={() => {
                if (multi) setDraft((d) => (on ? d.filter((k) => k !== o.key) : [...d, o.key]));
                else submit([o.key]);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                minHeight: 54,
                borderBottomWidth: i < options.length - 1 ? 1 : 0,
                borderBottomColor: colors.sand,
              }}>
              <AppText style={{ flex: 1, fontFamily: on ? fonts.sansSemibold : fonts.sansMedium, fontSize: 15, lineHeight: 22 }}>
                {o.label}
              </AppText>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: multi ? 6 : 11,
                  borderWidth: on ? 0 : 1.5,
                  borderColor: colors.border,
                  backgroundColor: on ? colors.actionRed : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {on ? <Icon name="check" size={14} strokeWidth={3} color={colors.white} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {multi ? <Button label="Save" onPress={() => submit(draft)} loading={saving} /> : null}
    </>
  );
}
