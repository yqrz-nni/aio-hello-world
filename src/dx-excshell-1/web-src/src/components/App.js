import React from "react";
import { Provider, defaultTheme, View } from "@adobe/react-spectrum";
import ErrorBoundary from "react-error-boundary";

import AudienceList from "./screens/AudienceList";

export default function App(props) {
  return (
    <ErrorBoundary FallbackComponent={fallbackComponent}>
      <Provider theme={defaultTheme} colorScheme="light">
        <View padding="size-200">
          <AudienceList ims={props.ims} />
        </View>
      </Provider>
    </ErrorBoundary>
  );

  function fallbackComponent({ componentStack, error }) {
    return (
      <div>
        <h1>Something went wrong :(</h1>
        <pre>{componentStack + "\n" + error.message}</pre>
      </div>
    );
  }
}