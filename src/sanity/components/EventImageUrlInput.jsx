import { useCallback, useState } from 'react';
import { useClient, useFormValue } from 'sanity';
import { Stack, Button, Text, Box } from '@sanity/ui';
import { DownloadIcon } from '@sanity/icons';

export function EventImageUrlInput(props) {
  const client = useClient({ apiVersion: '2024-12-26' });
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

  const docId = useFormValue(['_id']);
  const imageUrl = props.value;

  const handleImport = useCallback(async () => {
    if (!imageUrl || !docId) return;
    setIsImporting(true);
    setStatus(null);

    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

      const blob = await response.blob();
      const filename = (() => {
        try {
          return new URL(imageUrl).pathname.split('/').pop() || 'imported.jpg';
        } catch {
          return 'imported.jpg';
        }
      })();

      const asset = await client.assets.upload('image', blob, { filename });

      await client
        .patch(docId)
        .set({
          EventImageUpload: {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
          },
        })
        .commit();

      setStatus('success');
    } catch (err) {
      console.error('Image import failed:', err);
      setStatus('error');
    } finally {
      setIsImporting(false);
    }
  }, [imageUrl, client, docId]);

  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      {imageUrl && (
        <Box>
          <Button
            text={isImporting ? 'Importing…' : 'Import to Sanity'}
            tone="primary"
            mode="ghost"
            icon={DownloadIcon}
            disabled={isImporting}
            onClick={handleImport}
          />
          {status === 'success' && (
            <Text size={1} muted style={{ marginTop: 6 }}>
              Imported — see Event Image field above.
            </Text>
          )}
          {status === 'error' && (
            <Text size={1} style={{ marginTop: 6, color: 'red' }}>
              Import failed. Check the console.
            </Text>
          )}
        </Box>
      )}
    </Stack>
  );
}
