import type { FC } from 'react';
import { Loader, Stack, Text } from '@mantine/core';

interface CenterLoaderProps {
  message?: string;
}

export const CenterLoader: FC<CenterLoaderProps> = ({ message }) => (
  <Stack align="center" justify="center" py="lg" gap="xs">
    <Loader color="indigo" />
    {message && (
      <Text size="sm" c="dimmed">
        {message}
      </Text>
    )}
  </Stack>
);
