import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
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
  useMeQuery,
} from "../generated/graphql";
import { UpdootSection } from "./UpdootSection";
interface PostSectionProps {
  posts: PostSnippetFragment[];
}

export const PostSection: React.FC<PostSectionProps> = ({ posts }) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data }] = useMeQuery();
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
                {data?.me?.id === p.creator.id && (
                  <Box ml="auto">
                    <NextLink href="/post/edit/[id]" as={`/post/edit/${p.id}`}>
                      <IconButton
                        as={Link}
                        mr={4}
                        colorScheme="teal"
                        aria-label="Edit post"
                        icon={<EditIcon />}
                      />
                    </NextLink>
                    <IconButton
                      onClick={() => deletePost({ id: p.id })}
                      colorScheme="red"
                      aria-label="Delete post"
                      icon={<DeleteIcon />}
                    />
                  </Box>
                )}
              </Flex>
            </Box>
          </Flex>
        )
      )}
    </Stack>
  );
};
