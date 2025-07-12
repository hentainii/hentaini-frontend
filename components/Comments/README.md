# Sistema de Reacciones

## Descripción
Sistema de reacciones que permite a los usuarios expresar sus emociones sobre episodios, series u otro contenido.

## Tipos de Reacciones
- **Like** (Me gusta): 👍
- **Love** (Me encanta): ❤️
- **Wow** (Me sorprende): 😮
- **Dislike** (Me disgusta): 👎
- **Sad** (Me entristece): 😢

## Componentes

### ReactionsBar
Barra de reacciones que muestra botones para cada tipo de reacción con contadores.

**Props:**
- `contentType` (String): Tipo de contenido ('episode', 'serie', etc.)
- `contentId` (Number/String): ID del contenido

**Eventos:**
- `@show-login`: Se emite cuando un usuario no autenticado intenta reaccionar

### Uso
```vue
<ReactionsBar
  :content-type="'episode'"
  :content-id="123"
  @show-login="handleShowLogin"
/>
```

## Store
El store `reactions` maneja el estado global de las reacciones:

### Estados
- `reactions`: Array de reacciones
- `loading`: Estado de carga
- `error`: Mensaje de error
- `reactionStats`: Estadísticas de cada tipo de reacción
- `userReaction`: Reacción del usuario actual

### Acciones
- `loadReactions`: Cargar reacciones de un contenido
- `toggleReaction`: Alternar reacción del usuario
- `createOrUpdateReaction`: Crear nueva reacción
- `deleteReaction`: Eliminar reacción

## Backend - Schema Strapi 4

```javascript
{
  "kind": "collectionType",
  "collectionName": "reactions",
  "info": {
    "singularName": "reaction",
    "pluralName": "reactions",
    "displayName": "reaction",
    "description": ""
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "reaction_type": {
      "type": "enumeration",
      "enum": ["like", "love", "wow", "dislike", "sad"]
    },
    "entity_type": {
      "type": "string"
    },
    "content_id": {
      "type": "integer"
    },
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user",
      "inversedBy": "reactions"
    }
  }
}
```

## Funcionalidades
- ✅ Mostrar estadísticas de reacciones
- ✅ Reaccionar como usuario autenticado
- ✅ Cambiar reacción (de like a love, etc.)
- ✅ Eliminar reacción (hacer click en la misma reacción)
- ✅ Manejo de errores y estados de carga
- ✅ Diseño responsive
- ✅ Soporte para múltiples idiomas

## Integración
El sistema está integrado automáticamente en el componente `Comments.vue` y se muestra en la parte superior de la sección de comentarios. 