<?php
/** @var \App\Model\Product $product */
/** @var \App\Service\Router $router */

$title = "{$product->getName()} ({$product->getId()})";
$bodyClass = 'show';

ob_start(); ?>
    <h1><?= $product->getName() ?></h1>
    <article>
        <p class="product-info">
            <strong>Price:</strong> $<?= number_format($product->getPrice(), 2) ?><br>
            <strong>Available Stock:</strong> <?= $product->getQuantity() ?> units
        </p>
        
        <?php if ($product->getDescription()): ?>
            <div class="product-description">
                <h2>Description</h2>
                <p><?= nl2br($product->getDescription()) ?></p>
            </div>
        <?php endif; ?>
    </article>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('product-index') ?>">Back to list</a></li>
        <li><a href="<?= $router->generatePath('product-edit', ['id'=> $product->getId()]) ?>">Edit</a></li>
        <li>
            <form action="<?= $router->generatePath('product-delete') ?>" method="post">
                <input type="hidden" name="id" value="<?= $product->getId() ?>">
                <input type="submit" value="Delete" onclick="return confirm('Are you sure?')">
            </form>
        </li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
