export async function pause(millis: number): Promise<void> {
  return new Promise((accept) => {
    setTimeout(accept, millis);
  });
}
