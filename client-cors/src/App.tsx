import { ThemeProviderComponent } from "#core/theme";
import { RouterComponent } from "#core/router";

function App() {
  return (
    <ThemeProviderComponent>
      <RouterComponent />
    </ThemeProviderComponent>
  );
}

export default App;
