import {
    CHANGE_QUERY, RENDER_NEW_QUERY, HASH_UPDATED, HITS_RECEIVED,
    INCREASE_HITS_COUNT, LINK_CLICK, CHANGE_SELECTION
} from '../actions'


const frontend = (state = {}, action) => {
    switch (action.type) {
    case CHANGE_QUERY:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                new: action.text
            }
        }
    case RENDER_NEW_QUERY:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                current: state.queryText.new
            },
            active_hit: action.resetActiveHit ? 0 : state.active_hit
        }
    case HASH_UPDATED:
        return {
            ...state,
            queryText: {
                ...state.queryText,
                current: action.query,
                new: action.query,
            }
        }
    case INCREASE_HITS_COUNT:
        return {
            ...state,
            size: state.size + 10
        }
    case LINK_CLICK:
        return {
            ...state,
            active_hit: action.i
        }
    case CHANGE_SELECTION:
        return {
            ...state,
            active_hit: Math.max(0, Math.min(state.active_hit + action.by, state.size - 1))
        }
    default:
        return state
    }
}

const hits = (state = {}, action) => {
    switch(action.type) {
    case HITS_RECEIVED:
        return {
            ...state, ...action
        }
    default:
        return state
    }
}

export default {frontend, hits}

