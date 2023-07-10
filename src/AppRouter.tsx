import { Redirect, Route, Switch } from "wouter";
import HomeView from "./views/HomeView";
import WorldMapView from "./views/WorldMapView";

export default function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomeView} />
      <Route path="/:worldSlug">
        {(params) => <Redirect to={`/${params.worldSlug}/overworld`} />}
      </Route>
      <Route path="/:worldSlug/:dimensionSlug" component={WorldMapView} />
    </Switch>
  );
}
