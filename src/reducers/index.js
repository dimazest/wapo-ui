import * as actions from '../actions'


const frontend = (state = {}, action) => {
    switch (action.type) {
    case actions.CHANGE_QUERY:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                new: action.text
            }
        }
    case actions.RENDER_NEW_QUERY:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                current: state.queryText.new || null
            },
            active_hit: action.resetActiveHit ? 0 : state.active_hit
        }
    case actions.HASH_UPDATED:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                current: action.query,
                new: action.query,
            }
        }
    case actions.INCREASE_HITS_COUNT:
        return {
            ...state,
            size: state.size + 10
        }
    case actions.LINK_CLICK:
        return {
            ...state,
            active_hit: action.i
        }
    case actions.CHANGE_SELECTION:
        return {
            ...state,
            active_hit: Math.max(0, Math.min(state.active_hit + action.by, state.size - 1))
        }
    case actions.QUERY_INPUT_FOCUS_CHANGE:
        return {
            ...state,
            queryInputFocused: action.focused
        }
    case actions.SET_CREDENTIALS:
        return {
            ...state,
            user: action.userName,
        }
    default:
        return state
    }
}

const hits = (state={}, action) => {
    switch (action.type) {
    case actions.HITS_RECEIVED:
        return {
            ...state, ...action
        }
    default:
        return state
    }
}


const relevance = (state={}, action) => {
    switch (action.type) {
    case actions.RELEVANCE_CLICK:
        return {
            ...state,
            [action.user]: {
                ...state[action.user],
                [action.query]: {
                    ...(state[action.user] || {})[action.query],
                    [action.docID]: action.judgment,
                }
            }
        }
    default:
        return state
    }
}


export default {frontend, hits, relevance}

