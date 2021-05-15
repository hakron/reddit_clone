import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment } from "../generated/graphql";
import { UpdootSection } from "./UpdootSection";

interface PostSectionProps {
  posts: PostSnippetFragment[];
}

export const PostSection: React.FC<PostSectionProps> = ({ posts }) => {
  return (
    <Stack spacing={8}>
      {posts.map((p) => (
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
          <UpdootSection points={p.points} />
        </Flex>
      ))}
    </Stack>
  );
};
