import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import { Provider } from "urql";
import { client } from "../utils/graphqlClient";


import theme from "../theme";





function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
