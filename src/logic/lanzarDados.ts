// Logica

/**
 1 caña con punto y las demás lisas, se avanza 1 casilla.
 2 cañas con punto y las demás lisas, se avanzan 2 casillas.
 3 cañas con punto y las demás lisas, se avanzan 3 casillas.
 4 cañas con punto y la restante lisa, se avanzan 4 casillas.
 5 cañas con punto, se avanzan 10 casillas.
 5 cañas mostrando la cara lisa, no se avanza y se cede el turno al siguiente jugador
 */

export const lanzarDados = (conPunto: number) => {
  switch (conPunto) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 3;
    case 4:
      return 1;
    case 5:
      return 10;
  }
};
