import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { Alert, Platform } from 'react-native'
import ProfileScreen from './ProfileScreen'
import { useApp } from '../context/AppContext'

jest.mock('../context/AppContext', () => ({ useApp: jest.fn() }))
jest.mock('../components/Icon', () => ({ Icon: () => null }))
jest.mock('expo-linear-gradient', () => {
  const React = require('react')
  const { View } = require('react-native')
  return { LinearGradient: (props) => React.createElement(View, props) }
})

describe('ProfileScreen — sair', () => {
  const originalPlatform = Platform.OS
  const originalConfirm = globalThis.confirm
  const logout = jest.fn()

  beforeEach(() => {
    logout.mockReset()
    useApp.mockReturnValue({
      currentUser: { nome: 'Lorena', email: 'lorena@a.com' },
      logout,
    })
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform })
    globalThis.confirm = originalConfirm
  })

  it('pede confirmação antes de sair', () => {
    const { getByText, queryByText } = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />)
    expect(queryByText('Deseja sair?')).toBeNull()

    fireEvent.press(getByText('Sair'))

    expect(getByText('Deseja sair?')).toBeTruthy()
    expect(logout).not.toHaveBeenCalled()
  })

  it('faz logout quando a usuária confirma', () => {
    const { getByText } = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />)

    fireEvent.press(getByText('Sair'))
    fireEvent.press(getByText('Sair da conta'))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('mantém a sessão quando a usuária cancela', () => {
    const { getByText, queryByText } = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />)

    fireEvent.press(getByText('Sair'))
    fireEvent.press(getByText('Cancelar'))

    expect(logout).not.toHaveBeenCalled()
    expect(queryByText('Deseja sair?')).toBeNull()
  })
})
