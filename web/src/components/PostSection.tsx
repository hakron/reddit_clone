import {
  Box,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import {
  PostSnippetFragment,
  useDeletePostMutation,
} from "../generated/graphql";
import { UpdootSection } from "./UpdootSection";
import { DeleteIcon } from "@chakra-ui/icons";
interface PostSectionProps {
  posts: PostSnippetFragment[];
}

export const PostSection: React.FC<PostSectionProps> = ({ posts }) => {
  const [, deletePost] = useDeletePostMutation();
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
              voteStatus={p.voteStatus}
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
                <IconButton
                  onClick={() => deletePost({ id: p.id })}
                  colorScheme="red"
                  aria-label="Delete post"
                  icon={<DeleteIcon />}
                />
              </Flex>
            </Box>
          </Flex>
        )
      )}
    </Stack>
  );
};
