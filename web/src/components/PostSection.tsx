import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { PostSnippetFragment } from "../generated/graphql";
import { EditDeletePostButtons } from "./EditDeletePostButtons";
import { UpdootSection } from "./UpdootSection";
interface PostSectionProps {
  posts: PostSnippetFragment[];
}

export const PostSection: React.FC<PostSectionProps> = ({ posts }) => {
  return (
    <Stack spacing={8}>
      {posts.map((p) =>
        !p ? null : (
          <Flex
            key={p.id}
            p={5}
            shadow="md"
            borderWidth="1px"
            justifyContent="space-between"
          >
            <UpdootSection
              postId={p.id}
              points={p.points}
              voteStatus={p.voteStatus as number | null}
            />
            <Box flex={1} ml={4}>
              <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                <Link>
                  <Heading fontSize="xl">{p.title}</Heading>
                </Link>
              </NextLink>
              <Text>posted by: {p.creator.username}</Text>
              <Flex align="center">
                <Text flex={1} mt={4}>
                  {p.textSnippet}
                </Text>
                <Box ml="auto">
                  <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                </Box>
              </Flex>
            </Box>
          </Flex>
        )
      )}
    </Stack>
  );
};
