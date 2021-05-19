import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";

interface EditPostProps {}

const EditPost: React.FC<EditPostProps> = ({}) => {
  return <div>hello</div>;
};

export default withUrqlClient(createUrqlClient)(EditPost);
