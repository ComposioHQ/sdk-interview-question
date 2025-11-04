# Composio SDK Design Challenge


## Task

Build a SDK that allows someone to build type-safe sdks with a simple zustand like interface.

The SDK should make it easy to define the states, their types and the transitions between states in a type-safe manner.

To submit this, you have 90 mins and i want two things in order of priority
1. design doc -> this should be another md file in the repo that you make
2. the basic implementation, don't have to fully work but as far as you can get is ideal


### What are state machines

State machines are contracts where you move from one state to another by pre specified transitions. in the below example if you are in the DRAFT state, you can only move to DRAFT (by update document) or REVIEW (by begin review)

![example state machine](https://utfs.io/f/f7900d2a-1e91-4106-8f40-0b0317df08bc-w03t4m.png)

**For this task, both the states and the transitions should be type-safe and predefined by the developer using this sdk**

### What are Discriminated Unions?

Discriminated unions are a pattern for creating types that can be one of several different shapes, with a common property (the "discriminant") that lsp uses to narrow the type:

```typescript
// The 'kind' property is the discriminant
type WebSocketState = 
  | { kind: 'idle' }
  | { kind: 'connecting'; attempt: number }
  | { kind: 'connected'; socket: WebSocket; connectedAt: Date }
  | { kind: 'error'; message: string; canRetry: boolean }


const state: WebSocketState = {kind: "idle"}

switch (state.kind) {
  case "connecting": {
    console.log("connecting with attempt", state.attempt)
    break
  }
  case "connected": {
    console.log("connected at", state.connectedAt)
    return state.socket
  }
  case "error": {
    console.log("failed to connect", state.message)
    break
  }
  case "idle": {
    console.log("is idle")
    break
  }
}
```

You can play with the types [here](https://www.typescriptlang.org/play/?#code/PTAEBUAsFNQcgNYEsB2ATOoAOAnA9ltDgC4CeoSAzqMTKGlQMY5IC2qAhisQFBmGgA6tABGAZTyME0YmOIdisALygeoUAB9QAb1DJ0ALnhI0AG2iYAvms069qNEbiM8KFNEbFUAczgBuUAVFVixiIxQAV1YRIlBrdS1dfUd4FzcPRQwAyklpMKFRCSkZALT3T2g0AEF8gBEFWHjbJIcnInwcf1BWaEpKDm9oI0piFhRvUq4AJRkcUiMRPDxzLjiedbSR0BGG0BVtZKMAIhNzI8tA6mFxXJk5BvWeTeJQADMIlEY90AAKAEo9gA+HTrSgAdyQxEYkF+O0UADpkgDtDZGBxKLAjmUMj4jkYUep1JtltB4aY8N4fljXOUvONQBDaIFiMFQkcADTbeQIoLQELEP42dQiHDQDgIGxNNEY0DU9IVNB4kGE0DE8xkilU7EK5kcrkNeHazI1QUq0XECI4FD6hE5Yq8dRS9GY9p4HBKgmEtWk8mUo6vDhIcxoGh4VU0jJ6uGknp9AbQU2EkViiWO1HO2WnaAeoXhlA5dW+qlUChmbOJ4Wi8WSnjWc2W60fNDQV6oSq1oA) and see how they are discriminating in each case


### Expected Usage

It should be usable like this:

```tsx
const useWebsocketStore = () => {
  // YOUR SDK used here

  // define state.kind (types of the state of the state machine explicitly)
  // define state transitions explicitly (which states can go to which other states)
  // define actions how the state has a transition to another state explicitly
  // these are the contracts of the state machine

  return { state, actions };
};

const App = () => {
  const { state, actions } = useWebsocketStore();

  switch (state.kind) {
    case "idle": {
      return <button onClick={() => actions.connect(state)}>Connect</button>;
    }
    case "connecting": {
      return <p>Connecting...</p>;
    }
    case "connected": {
      return (
        <button onClick={() => actions.disconnect(state)}>Disconnect</button>
      );
    }
    case "error": {
      return <p>Something went wrong: {state.errorMessage}</p>;
    }
  }
};
```

Use `test/sdk.tsx` to design the API.

### Implementation Details

The seeded code is in `src/` from `zustand`. Feel free to throw it out if you'd prefer, but use it as a start on how to build this type of tool - you can choose another API if you find that better.


### References

1. [zustand](https://github.com/pmndrs/zustand) - Also have an `example_zustand.tsx` file inside docs you can look at
   ```ts
   // Basic Zustand example
   import { create } from 'zustand'

   // Define your store
   const useStore = create((set) => ({
     // State
     count: 0,
     
     // Actions
     increment: () => set((state) => ({ count: state.count + 1 })),
     decrement: () => set((state) => ({ count: state.count - 1 })),
     reset: () => set({ count: 0 }),
   }))

   // Use in a component
   function Counter() {
     const { count, increment, decrement, reset } = useStore()
     
     return (
       <div>
         <h1>{count}</h1>
         <button onClick={increment}>Increment</button>
         <button onClick={decrement}>Decrement</button>
         <button onClick={reset}>Reset</button>
       </div>
     )
   }
   ```

2. [discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
   ```ts
   // Basic TypeScript discriminated union example
   type NetworkState =
     | { status: 'disconnected' }
     | { status: 'connecting' }
     | { status: 'connected' }
     | { status: 'error'; errorMessage: string };

   // Using the discriminated union
   function handleNetworkState(state: NetworkState) {
     // The 'status' property acts as the discriminant
     switch (state.status) {
       case 'disconnected':
         return 'Ready to connect';
       case 'connecting':
         return 'Establishing connection...';
       case 'connected':
         return 'Connection established';
       case 'error':
         // TypeScript knows 'errorMessage' exists only in this case
         return `Error: ${state.errorMessage}`;
     }
   }
   ```