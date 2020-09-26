export default function cleanCommentSymbols(comments) {
  const lineComments = comments.filter((c) => c.type === "CommentLine");
  lineComments.forEach((comment) => {
    if (comment.value.includes("@")) {
      comment.value = comment.value.replace(/"@|@"/g, "");
    }
  });
}
