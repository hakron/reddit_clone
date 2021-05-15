import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";

interface UpdootSectionProps {
  points: number;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ points }) => {
  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <IconButton
        onClick={() => console.log(`yo`)}
        colorScheme="green"
        aria-label="Updoot post"
        icon={<ChevronUpIcon />}
      />
      {points}
      <IconButton
        onClick={() => console.log(`sup`)}
        colorScheme="red"
        aria-label="Downdoot post"
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};
