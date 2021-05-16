import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
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
            <NextLink href="/post/[id]" as={`/post/${p.id}`}>
              <Link>
                <Heading fontSize="xl">{p.title}</Heading>
              </Link>
            </NextLink>
            <Text>posted by: {p.creator.username}</Text>
            <Text mt={4}>{p.textSnippet}</Text>
          </Box>
          <UpdootSection
            postId={p.id}
            points={p.points}
            voteStatus={p.voteStatus}
          />
        </Flex>
      ))}
    </Stack>
  );
};
