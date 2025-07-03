# sistema_node
Proyecto escolar con Node.js

Esto **es un texto** en *cursiva*.
Esto también es un texto en __cursiva__.

### Este es el texto H3

[Enlace a una imagen.](/learn/azure-devops/shared/media/mara.png)

[Enlace a Microsoft Training](https://learn.microsoft.com/en-us/training/)

1. Primero
2. Segundo
3. Tercero

- Primero
  - Nuevo
- Segundo
- Tercero

Primero|Segundo
-|-
1|2
5|6
3|4


> Este es un texto citado.

Esto es `código`.

Esto es una funcion:

```javascript
export const getAll = (req, res) => {
    const query = 'SELECT * FROM usuarios';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
}
```
