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
    case actions.TOGGLE_TOPIC_FORM:
        return {
            ...state,
            showTopicForm: action.showTopicForm,
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
    case actions.LOAD_JUDGMENTS: {
        const judgments = {}

        for (let p of action.payload){
            judgments[p.query] = [
                ...judgments[p.query],
                p.judgment
            ]
        }

        return judgments
    }
    case actions.RELEVANCE_CLICK:
        return {
            ...state,
            [action.query]: {
                ...state[action.query],
                [action.docID]: action.judgment,
            }
        }
    default:
        return state
    }
}

const topic = (state={}, action) => {
    switch (action.type) {
    case actions.LOAD_TOPIC_INFO:
        return {
            ...action.payload,
        }
    default:
        return state
    }

}

const topics = (state={}, action) => {
    switch (action.type) {
        case actions.TOPICS_RECEIVED:
            return {
                ...state,
                topics: action.topics
        }
        case actions.RELEVANCE_RECEIVED:

        return {
            ...state,
            ...action,
        }
        default:
            return state
    }

}

export default {frontend, hits, relevance, topic, topics}
