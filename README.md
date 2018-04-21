# Ignis

Ignis is a [SASS](http://sass-lang.com/) library that I developed to create websites.
Its main feature is a **BEM system**, though it also includes some other useful features:

- Smoother background gradients with easing functions
- Context stacks: A temporary data storage
- Property trees: A persistent data storage
- Fluid properties: A generalization of fluid typography
- Modular scales

All features are explained in detail in the Wiki.

## BEM system

Ignis provides a [BEM](https://en.bem.info/) system, i.e. a large variety of mixins you can use to create BEM-compliant stylesheets.

These mixins basically have two functions:
1. Check if they are used correctly. For example, if nested elements are disallowed, the element mixin will throw an error if you try to create a nested element.
2. Generate an optimal selector.

Below is a basic example of the BEM system can be used:

```scss
@include ig-bem-object('media') {
    display:         flex;
    align-items:     flex-start;
    justify-content: flex-start;

    @include ig-bem-element('image') {
        display:  block;
        flex:     0 0 auto;
        order:    1;
        overflow: hidden;
    }

    @include ig-bem-element('body') {
        order: 2;
    }

    @include ig-bem-modifier('rtl') {
        justify-content: flex-end;

        @include ig-bem-element('image') {
            order: 2;
        }

        @include ig-bem-element('body') {
            order: 1;
        }
    }
}
```

The result is this CSS:

```css
.o-media {
    display:         flex;
    align-items:     flex-start;
    justify-content: flex-start;
}

.o-media__image {
    display:  block;
    flex:     0 0 auto;
    order:    1;
    overflow: hidden;
}

.o-media__body {
    order: 2;
}

.o-media--rtl {
    justify-content: flex-end;
}

.o-media--rtl .o-media__image {
    order: 2;
}

.o-media--rtl .o-media__body {
    order: 1;
}
```

## Smoother background gradients

The background gradients generated by browsers usually have a pretty hard transition from one color to another. In some situations, this results in a clearly visible edge where the transition ends.

[Andreas Larsen wrote an article on CSS-Tricks](https://css-tricks.com/easing-linear-gradients/) where this whole problem is explained in detail.
He also developed a solution, a [PostCSS plugin](https://github.com/larsenwork/postcss-easing-gradients) which automatically converts linear gradients using an easing function into regular linear-gradients.

This solution works for simple use cases, but unfortunately it wasn't suitable for me.
First, I wanted to use easing radial-gradients as well, which aren't supported by the PostCSS plugin.
And second, I wanted to freely position the color stops and not be locked to 0% for the start and 100% for the end.

The easing gradients provided by Ignis address the above problems.
Moreover, they have one more major feature: You can use multiple color stops with varying easing functions.
The syntax is similar to the [new CSS proposal](https://github.com/w3c/csswg-drafts/issues/1332).

Example usage:

```scss
.test {
    background-image: ig-easing-linear-gradient(
        to right,
        #000 2em,
        #f00,
        in-out-sine,
        transparent 10em
    );
}
```

This will generate a linear-gradient where black normally fades into red, from 2em to 6em.
Then, red *smoothly* fades into transparent, from 6em to 10em.
After that, the gradient remains transparent.

## Context stacks

Context stacks are a temporary data storage and, as the name suggests, are used like a conventional stack data structure.
This means: Whenever you want to store a context -- which can be any kind of data, such as a map, a list, a string, etc... -- you push it to the stack.
From then on, this context is publicly accessible.
In order to remove it, you pop the stack.

This feature becomes extremely useful when paired with mixins and their `@content` directive.
The BEM system, for example, uses a context stack as a call stack and thus can attach metadata to the generated selectors.

Below is an example of how context stacks can be used:

```scss
$context-id: 'some-context-stack';

@mixin anything($p) {
    @include ig-context-push($context-id, 'anything', (
        --this: 1,
        --is:   true,
        --the:  'test',
        --data: $p
    ));

    @content;

    @include ig-context-pop($context-id);
}

// Usage:

.test {
    @include anything('hello') {
        $context-data: nth(ig-context-get($context-id, 'anything'), 2);
        $this: map-get($context-data, --this); // 1
        $is:   map-get($context-data, --is);   // true
        $the:  map-get($context-data, --the);  // 'test'
        $data: map-get($context-data, --data); // 'hello'
    }
}
```

## Property trees

Property trees are essentially globally accessible maps which can be saved and read from using certain functions.
I use this feature for my website to manage various color schemes.

Example usage:

```scss
@include ig-props-set((
    --accent:      #f00,
    --accent-text: #fff,

    --background:     #fff,
    --text:           #222,
    
    --link: (
        --idle: (
            --text:      #000,
            --underline: #f00
        ),
        --hover: (
            --text:      #f00,
            --underline: #f00
        )
    )
), 'light');

// Usage:

p {
    color:            ig-props-get(--text, 'light');       // #222
    background-color: ig-props-get(--background, 'light'); // #fff
}

a {
    color:            ig-props-get(--link --idle --text, 'light');                // #000
    border-bottom:    1px solid ig-props-get(--link --idle --underline, 'light'); // #f00
    text-decoration:  none;

    &:hover {
        color:               ig-props-get(--link --hover --text, 'light');      // #f00
        border-bottom-color: ig-props-get(--link --hover --underline, 'light'); // #f00
    }
}
```

## Fluid properties

[Fluid typography](https://www.smashingmagazine.com/2016/05/fluid-typography/) is a technique where font sizes dynamically respond to the viewport size, thanks to viewport units like `vw`, `vh` and so on.
This concept can be generalized to work with any property that accepts a numeric input.

```scss
.title {
    @include ig-fluid-property(font-size, ( 20rem: 2.1rem, 40rem: 2.6rem, 60rem: 3.5rem ));
}
```

The font-size will be 2.1rem if the viewport is 20rem wide, 2.6rem if it's 40rem wide, and 3.5rem if it's 60rem wide.
If the viewport is narrower than 20rem, the font-size will stick with 2.1rem.
If the viewport is wider than 60rem, the font-size will stick with 3.5rem.

If you use [include-media](https://include-media.com/), there is also another mixin `ig-fluid-property-im` which supports include-media viewports.
So instead of the example above, you could also use something like this:

```scss
.title {
    @include ig-fluid-property(font-size, ( phone: 2.1rem, tablet: 2.6rem, desktop: 3.5rem ));
}
```

## Modular scales

Modular scales are collections of values that have a common ratio. They are commonly used to make a design appear more appealing.

Ignis provides mixins to create basic and even multi-stranded modular scales.

Using a basic modular scale:

```scss
h1 {
   font-size: ig-harmony-modular-scale(3, 1em, 1.1); // Will be: 1.331em
}
h2 {
   font-size: ig-harmony-modular-scale(2, 1em, 1.1); // Will be: 1.21em
}
h3 {
   font-size: ig-harmony-modular-scale(1, 1em, 1.1); // Will be: 1.1em
}
```

Using a multi-stranded modular scale:

```scss
h1 {
   font-size: ig-harmony-modular-scale(3, 1em 2em, 1.1); // Will be: 1.128em
}
h2 {
   font-size: ig-harmony-modular-scale(2, 1em 2em, 1.1); // Will be: 1.1em
}
h3 {
   font-size: ig-harmony-modular-scale(1, 1em 2em, 1.1); // Will be: 1.026em
}
```
