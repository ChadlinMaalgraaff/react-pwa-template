import type { Meta, StoryObj } from '@storybook/react'
import Card from './Card'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Card Title',
    children: 'This is a card component with content.',
  },
}

export const WithDescription: Story = {
  args: {
    title: 'Card with Description',
    description: 'This is a card description that provides more context.',
    children: 'Card content goes here.',
  },
}

export const ContentOnly: Story = {
  args: {
    children: 'A simple card with just content, no title.',
  },
}
