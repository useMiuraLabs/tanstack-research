export type AuthState =
  | { status: 'unknown' }
  | { status: 'anonymous' }
  | { status: 'authenticated' }

type ReadyAuthState = Exclude<AuthState, { status: 'unknown' }>

export type AuthContext = {
  state: AuthState
  waitForReady: () => Promise<ReadyAuthState>
  login: () => Promise<ReadyAuthState>
  logout: () => void
}

const anonymousAuthState: ReadyAuthState = {
  status: 'anonymous',
}

const authenticatedAuthState: ReadyAuthState = {
  status: 'authenticated',
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
  login: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        initialAuthContext.state = authenticatedAuthState
        resolve(authenticatedAuthState)
      }, 1_200)
    }),
  logout: () => {
    initialAuthContext.state = anonymousAuthState
  },
}
