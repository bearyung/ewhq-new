import { useState, useEffect, useRef } from 'react';
import { Box, Container, Title, Group, Text } from '@mantine/core';
import type { ReactNode, FC } from 'react';

const BREADCRUMB_HEIGHT = 48;

const getScrollParent = (element: HTMLElement | null): HTMLElement | Window => {
  if (!element) {
    return window;
  }

  let parent: HTMLElement | null = element.parentElement;

  while (parent) {
    const { overflowY, overflowX, overflow } = window.getComputedStyle(parent);
    const hasScroll = [overflowY, overflowX, overflow].some((value) =>
      /(auto|scroll|overlay)/.test(value ?? '')
    );

    if (hasScroll) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return window;
};

type HeaderSpacing = 'comfortable' | 'compact';

const HEADER_SPACING: Record<HeaderSpacing, { pt: string; pb: string }> = {
  comfortable: { pt: 'xl', pb: 'xl' },
  compact: { pt: 'md', pb: 'sm' },
};

interface ScrollingHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode; // For additional content like floating save bars
  spacing?: HeaderSpacing;
  forceCompact?: boolean;
  compactShadow?: boolean;
}

const ScrollingHeader: FC<ScrollingHeaderProps> = ({
  title,
  subtitle,
  actions,
  children,
  spacing = 'comfortable',
  forceCompact = false,
  compactShadow = true
}) => {
  const [isCompact, setIsCompact] = useState(forceCompact);
  const headerRef = useRef<HTMLDivElement>(null);
  const { pt, pb } = HEADER_SPACING[spacing];
  const compactVisible = forceCompact || isCompact;

  useEffect(() => {
    if (forceCompact) {
      setIsCompact(true);
      return;
    }

    const element = headerRef.current;
    if (!element) {
      return;
    }

    const scrollTarget = getScrollParent(element);

    const updateCompactState = () => {
      if (!headerRef.current) {
        return;
      }

      const { bottom } = headerRef.current.getBoundingClientRect();
      const headerHidden = bottom <= BREADCRUMB_HEIGHT;

      setIsCompact((prev) => (prev === headerHidden ? prev : headerHidden));
    };

    // Run once after mount to set initial state
    requestAnimationFrame(updateCompactState);

    const listenerOptions: AddEventListenerOptions = { passive: true };

    scrollTarget.addEventListener('scroll', updateCompactState, listenerOptions);

    window.addEventListener('resize', updateCompactState);

    return () => {
      scrollTarget.removeEventListener('scroll', updateCompactState, listenerOptions);
      window.removeEventListener('resize', updateCompactState);
    };
  }, [forceCompact]);

  useEffect(() => {
    if (!forceCompact) {
      return;
    }

    setIsCompact(true);
  }, [forceCompact]);

  return (
    <>
      {/* Compact Header - Shows when main header is out of view */}
      <Box
        style={{
          position: 'sticky',
          top: BREADCRUMB_HEIGHT,
          zIndex: 99,
          height: 0,
          pointerEvents: 'none',
        }}
      >
        <Box
          px="xl"
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderBottom: '1px solid #E3E8EE',
            boxShadow: compactVisible && compactShadow ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            transform: compactVisible ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.3s ease-in-out',
            pointerEvents: compactVisible ? 'auto' : 'none',
          }}
        >
          <Container size="xl" style={{ marginInline: 0, width: '100%' }}>
            <Group justify="space-between">
              <Title order={3} size={20} fw={600}>
                {title}
              </Title>
              {actions && (
                <Group gap="sm">
                  {actions}
                </Group>
              )}
            </Group>
          </Container>
        </Box>
      </Box>

      {/* Full Header - Always rendered */}
      {!forceCompact && (
        <Box ref={headerRef} pt={pt} px="xl" pb={pb} style={{ backgroundColor: 'white' }}>
          <Container size="xl" style={{ marginInline: 0 }}>
            <Group justify="space-between">
              <Box>
                <Title order={1} size={28} fw={600}>
                  {title}
                </Title>
                {subtitle && (
                  <Text size="sm" c="dimmed" mt={4}>
                    {subtitle}
                  </Text>
                )}
              </Box>

              {actions && (
                <Group gap="sm">
                  {actions}
                </Group>
              )}
            </Group>
          </Container>
        </Box>
      )}

      {/* Additional children (like floating save bars) */}
      {children}
    </>
  );
};

export { ScrollingHeader };
