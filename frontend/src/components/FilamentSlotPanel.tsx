import React from 'react';
import { MaterialContext } from '../types';

/**
 * Shows which Bambu presets and plate LayerZero will use for the loaded file, and the AMS slots.
 * Slots are editable only when the file mixes material families in its model bodies
 * (e.g. PLA body + PETG body); otherwise the single filament picker in the header applies
 * to the body slots and support/interface slots keep the author's settings.
 */
interface FilamentSlotPanelProps {
  context: MaterialContext;
  filamentOptions: string[];
  slotFilaments: (string | null)[] | null;
  onSlotChange: (slotIndex: number, filament: string | null) => void;
}

const KEEP = '__keep__';

export const FilamentSlotPanel: React.FC<FilamentSlotPanelProps> = ({
  context,
  filamentOptions,
  slotFilaments,
  onSlotChange,
}) => {
  const editable = context.mixed_model_families;
  const showSlots = context.slots.length > 1 || editable;

  return (
    <div className="mt-3 p-3 rounded-[14px] bg-white dark:bg-[#1C1C1E] border border-black/[0.07] dark:border-white/[0.08]">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1D1D1F] dark:text-white">
        <i className="ph-bold ph-spiral text-[#0071E3]"></i>
        <span>Vật liệu & Mặt bàn in</span>
      </div>
      <div className="mt-1.5 text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
        <div>
          <span className="font-mono text-[#1D1D1F] dark:text-[#E5E5EA]">{context.filament_preset}</span>
        </div>
        <div>
          Máy {context.printer_label} {context.enclosed ? '(kín)' : '(mở)'} · Mặt bàn{' '}
          <span className="font-medium text-[#1D1D1F] dark:text-[#E5E5EA]">{context.bed_label}</span>
        </div>
      </div>

      {showSlots && (
        <div className="mt-2.5 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1.5">
          <div className="text-[10.5px] font-medium text-[#6E6E73] dark:text-[#8E8E93]">
            {editable
              ? 'File trộn nhiều vật liệu thân mẫu: chọn vật liệu cho từng slot'
              : 'Slot AMS (slot Support / vật liệu khác được giữ nguyên)'}
          </div>
          {context.slots.map((slot) => {
            const current = slotFilaments ? slotFilaments[slot.index] : slot.target_filament;
            return (
              <div key={slot.index} className="flex items-center gap-2 text-[11px]">
                <span
                  className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: slot.colour || '#FFFFFF' }}
                ></span>
                <span className="font-mono text-[#6E6E73] dark:text-[#8E8E93] shrink-0">#{slot.index + 1}</span>
                <span className="truncate flex-1 text-[#1D1D1F] dark:text-[#E5E5EA]" title={slot.preset}>
                  {slot.type || slot.preset || 'Không rõ'}
                </span>
                {editable ? (
                  <select
                    value={current ?? KEEP}
                    onChange={(e) => onSlotChange(slot.index, e.target.value === KEEP ? null : e.target.value)}
                    className="bg-black/[0.04] dark:bg-white/[0.06] rounded-md px-1.5 py-0.5 text-[11px] focus:outline-none cursor-pointer"
                  >
                    <option value={KEEP}>Giữ nguyên</option>
                    {filamentOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`text-[10.5px] font-medium px-1.5 py-0.5 rounded ${
                      current
                        ? 'bg-[#0071E3]/10 text-[#0071E3]'
                        : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6]'
                    }`}
                  >
                    {current ? `→ ${current}` : 'Giữ nguyên'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
