import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import logger from 'redux-logger'
import {createBrowserHistory, routerReducer, routerMiddleware, startListener} from 'redux-first-routing'
import thunkMiddleware from 'redux-thunk'
import {enableBatching} from 'redux-batched-actions'

import {hashUpdated} from './actions'
import reducers from './reducers'
import App from './App'

const history = createBrowserHistory()

const rootReducer = combineReducers({
    ...reducers,
    router: routerReducer
})

const initialState = {
    frontend: {
        queryText: {current: '', new: ''},
    }
}
const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
        logger,
        routerMiddleware(history),
        thunkMiddleware,
    )
)

startListener(history, store)

let currentHash = store.getState().router.hash
store.subscribe(() => {
    const previousHash = currentHash
    currentHash = store.getState().router.hash

    if (previousHash !== currentHash) {
        store.dispatch(hashUpdated(currentHash))
    }
})

render(
    <Provider store={store}>
    <App />
    </Provider>,
    document.getElementById('root')
)
