import type { Meta, StoryObj } from '@storybook/react'
import Input from '../components/shared/Input/Input'

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'user@example.com',
    type: 'email',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'user@example.com',
    type: 'email',
    error: 'Invalid email address',
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    helperText: 'Must be at least 8 characters',
  },
}

export const Required: Story = {
  args: {
    label: 'Name',
    placeholder: 'John Doe',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot be edited',
    disabled: true,
  },
}
