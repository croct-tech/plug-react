import {CroctProvider} from "../src";

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  (Story) => (
      <CroctProvider appId="00000000-0000-0000-0000-000000000000">
          <Story />
      </CroctProvider>
  ),
];
