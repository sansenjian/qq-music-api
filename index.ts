import app from './app';
import colors from './util/colors';

const PORT: number = typeof process.env.PORT === 'string' ? parseInt(process.env.PORT, 10) : (process.env.PORT || 3200);

if (require.main === module) {
  (app.listen as any)(PORT, () => {
    console.log(colors.prompt(`server running @ http://localhost:${PORT}`));
  });
}

export default app;
