import { Redirect, Route, Switch } from "wouter";
import HomeView from "./views/HomeView";
import WorldMapView from "./views/WorldMapView";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "./theme";
import { Suspense } from "react";
import AuthProvider from "./AuthProvider";

export default function AppRouter() {
  return (
    <Suspense fallback="suspense loading...">
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Switch>
            <Route path="/" component={HomeView} />

            <Route path="/:worldSlug">
              {(params) => <Redirect to={`/${params.worldSlug}/overworld`} />}
            </Route>

            <Route path="/:worldSlug/:dimensionSlug" component={WorldMapView} />
          </Switch>
        </AuthProvider>
      </ChakraProvider>
    </Suspense>
  );
}
