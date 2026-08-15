const body = $json.body ?? $json;

const value = body.entry?.[0]?.changes?.[0]?.value;
const message = value?.messages?.[0];
const contact = value?.contacts?.[0];

if (!message) {
  return [];
}

const MEDIA_TYPES = new Set(['image', 'audio', 'document', 'sticker', 'video', 'location']);
let text = '';

if (message.type === 'text') {
  text = message.text?.body ?? '';
}

if (message.type === 'button') {
  text = message.button?.text ?? message.button?.payload ?? '';
}

if (message.type === 'interactive') {
  text =
    message.interactive?.button_reply?.id ??
    message.interactive?.button_reply?.title ??
    message.interactive?.list_reply?.id ??
    message.interactive?.list_reply?.title ??
    '';
}

if (MEDIA_TYPES.has(message.type)) {
  const caption =
    message.image?.caption ||
    message.video?.caption ||
    message.document?.caption ||
    message.audio?.caption ||
    '';
  text = String(caption || '').trim();
  if (!text) {
    text = '__media_sin_texto__';
  }
}

return [
  {
    json: {
      telefono: message.from,
      nombre_whatsapp: contact?.profile?.name ?? null,
      message_id: message.id,
      message_type: message.type,
      text: String(text || '').trim(),
      raw: body,
    },
  },
];
