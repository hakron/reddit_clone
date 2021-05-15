import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });
  if (!fetching && !data) {
    return <div> query failed</div>;
  }
  return (
    <Layout>
      <Flex align="center">
        <Heading>Lireddit</Heading>
        <NextLink href="/create-post">
          <Link ml={"auto"}>Create Post</Link>
        </NextLink>
      </Flex>
      <br />
      {fetching && !data ? (
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => (
            <Flex
              key={p.id}
              p={5}
              shadow="md"
              borderWidth="1px"
              justifyContent="space-between"
            >
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text>posted by: {p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
              <Flex
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <IconButton
                  onClick={() => console.log(`yo`)}
                  colorScheme="green"
                  aria-label="Updoot post"
                  icon={<ChevronUpIcon />}
                />
                {p.points}
                <IconButton
                  onClick={() => console.log(`sup`)}
                  colorScheme="red"
                  aria-label="Downdoot post"
                  icon={<ChevronDownIcon />}
                />
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                //last element in the data.post
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
