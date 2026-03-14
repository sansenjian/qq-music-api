import app from './app';
import colors from './util/colors';

const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const PORT: number = Number.isFinite(parsedPort) ? parsedPort : 3200;

if (require.main === module) {
  (app.listen as any)(PORT, () => {
    console.log(colors.prompt(`server running @ http://localhost:${PORT}`));
  });
}

export default app;
