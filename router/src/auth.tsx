export type UserRole = 'user' | 'admin'

export type AuthUser = {
  id: string
  name: string
  role: UserRole
}

export type AuthState =
  | { status: 'unknown' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser }

type ReadyAuthState = Exclude<AuthState, { status: 'unknown' }>

export type AuthContext = {
  state: AuthState
  waitForReady: () => Promise<ReadyAuthState>
  loginAsUser: () => Promise<ReadyAuthState>
  loginAsAdmin: () => Promise<ReadyAuthState>
  logout: () => void
}

const anonymousAuthState: ReadyAuthState = {
  status: 'anonymous',
}

const userAuthState: ReadyAuthState = {
  status: 'authenticated',
  user: {
    id: 'user-1',
    name: 'Normal User',
    role: 'user',
  },
}

const adminAuthState: ReadyAuthState = {
  status: 'authenticated',
  user: {
    id: 'admin-1',
    name: 'Admin User',
    role: 'admin',
  },
}

export const initialAuthContext: AuthContext = {
  state: { status: 'unknown' },
  waitForReady: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        initialAuthContext.state = anonymousAuthState
        resolve(anonymousAuthState)
      }, 1_200)
    }),
  loginAsUser: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        initialAuthContext.state = userAuthState
        resolve(userAuthState)
      }, 1_200)
    }),
  loginAsAdmin: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        initialAuthContext.state = adminAuthState
        resolve(adminAuthState)
      }, 1_200)
    }),
  logout: () => {
    initialAuthContext.state = anonymousAuthState
  },
}
